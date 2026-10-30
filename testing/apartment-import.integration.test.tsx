import {
  startApartmentImportAction,
  downloadApartmentReportAction,
  downloadApartmentTemplateAction,
  refreshImportedApartmentsAction,
} from "../src/actions/apartment-import-flow.action";

import {
  isApartmentCredit,
  isApartmentOwnership,
  formatApartmentCredit,
  formatApartmentOwnership,
} from "../src/utilities/apartment-commercial.utility";

import { test } from "node:test";
import assert from "node:assert/strict";
import { AxiosError, AxiosHeaders } from "axios";
import { act, create } from "react-test-renderer";
import { setSession } from "../src/store/session.store";
import { queryClient } from "../src/providers/query-client";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { httpClient } from "../src/services/http-client.service";
import { PERMISSIONS } from "../src/constants/permission.constant";
import { useApartmentImport } from "../src/hooks/apartment-import.hook";
import { FileDownloadManager } from "../src/managers/file-download.manager";
import { apartmentImportService } from "../src/services/apartment-import.service";
import { USER_ROLES, USER_ROLE_VALUES } from "../src/constants/user-role.constant";
import { CUSTOMER_CONTACT_QUERY_ROOT } from "../src/constants/customer-contact.constant";
import type { TApartmentImportView } from "../src/interfaces/apartment-import.interface";
import { canImportApartments } from "../src/utilities/apartment-import-permission.utility";
import { isApartmentImportResponse } from "../src/utilities/guards/apartment-import.guard";
import { CUSTOMER_IMPORT_ERROR_COPY } from "../src/constants/customer-import-error.constant";

const response = {
  counts: { created: 1, existing: 1, duplicate: 0, error: 0 },
  rows: [{ rowNumber: 3, apartment: "12", status: "existing", reason: "קיימת" }],
  reportBase64: "eGxzeA==",
};
const file = new File(["workbook"], "input.xlsx");

test("response validation rejects malformed counts, rows and missing report field", () => {
  assert.equal(isApartmentImportResponse(response), true);
  assert.equal(isApartmentImportResponse(null), false);
  assert.equal(isApartmentImportResponse({ ...response, counts: { created: 1 } }), false);
  assert.equal(
    isApartmentImportResponse({ ...response, counts: { ...response.counts, error: -1 } }),
    false,
  );
  assert.equal(
    isApartmentImportResponse({ ...response, rows: [{ ...response.rows[0], status: "created" }] }),
    false,
  );
  assert.equal(
    isApartmentImportResponse({ ...response, rows: [{ ...response.rows[0], rowNumber: 1 }] }),
    false,
  );
  assert.equal(isApartmentImportResponse({ counts: response.counts, rows: response.rows }), false);
});

test("upload posts one real multipart file and progress becomes indeterminate at completion", async context => {
  const progress: Array<number | null> = [];
  context.mock.method(httpClient, "post", async (endpoint, body, config) => {
    assert.equal(endpoint, "/project/building-1/apartments/import");
    assert.ok(body instanceof FormData);
    assert.equal(body.getAll("file").length, 1);
    config.onUploadProgress({ loaded: 1, total: 2 });
    config.onUploadProgress({ loaded: 2, total: 2 });
    return { data: response };
  });
  const result = await apartmentImportService.upload({
    file,
    buildingId: "building-1",
    onProgress: value => progress.push(value),
  });
  assert.deepEqual(progress, [50, null]);
  assert.deepEqual(result, response);
});

test("upload response rejects a malformed server payload", async context => {
  context.mock.method(httpClient, "post", async () => ({ data: { bad: true } }));
  await assert.rejects(
    apartmentImportService.upload({ file, buildingId: "b", onProgress: () => {} }),
  );
});

test("successful orchestration preserves server results and report only in state", async context => {
  const views: TApartmentImportView[] = [];
  const reports: Array<string | null> = [];
  context.mock.method(httpClient, "post", async () => ({ data: response }));
  await startApartmentImportAction({
    file,
    buildingId: "b",
    setView: view => views.push(view),
    setReport: report => reports.push(report),
  });
  assert.equal(views[0].stage, "processing");
  assert.equal(views.at(-1)?.stage, "results");
  assert.deepEqual(reports, [null, response.reportBase64]);
});

test("422 template rejection differs from uncertain network failure", async context => {
  const views: TApartmentImportView[] = [];
  const options = {
    file,
    buildingId: "b",
    setView: (view: TApartmentImportView) => views.push(view),
    setReport: () => {},
  };
  const config = { headers: new AxiosHeaders() };
  const error = new AxiosError("bad template", "ERR_BAD_REQUEST", config, null, {
    status: 422,
    statusText: "Unprocessable Entity",
    headers: {},
    config,
    data: { code: "INVALID_TEMPLATE", message: "Invalid workbook: private internal detail" },
  });
  context.mock.method(httpClient, "post", async () => {
    throw error;
  });
  await startApartmentImportAction(options);
  assert.equal(views.at(-1)?.failure?.code, "INVALID_TEMPLATE");
  assert.equal(views.at(-1)?.failure?.message, CUSTOMER_IMPORT_ERROR_COPY.TEMPLATE);
  assert.equal(views.at(-1)?.refreshRequired, true);
  context.mock.restoreAll();
  const nonTemplateError = new AxiosError("server", "ERR_BAD_RESPONSE", config, null, {
    status: 500,
    statusText: "Error",
    headers: {},
    config,
    data: { code: "INVALID_TEMPLATE", message: "untrusted guarantee" },
  });
  context.mock.method(httpClient, "post", async () => {
    throw nonTemplateError;
  });
  await startApartmentImportAction(options);
  assert.equal(views.at(-1)?.failure?.code, null);
  context.mock.restoreAll();
  context.mock.method(httpClient, "post", async () => {
    throw new Error("network");
  });
  await startApartmentImportAction(options);
  assert.match(views.at(-1)?.failure?.message ?? "", /ייתכן ששורות כבר נקלטו/);
});

test("template uses authenticated client blob route and static download filename", async context => {
  const blob = new Blob(["workbook"]);
  context.mock.method(httpClient, "get", async (endpoint, config) => {
    assert.equal(endpoint, "/project/b/apartments/import/template");
    assert.equal(config.responseType, "blob");
    return { data: blob };
  });
  context.mock.method(FileDownloadManager, "download", (download, name) => {
    assert.equal(download, blob);
    assert.equal(name, "apartments-template.xlsx");
  });
  await downloadApartmentTemplateAction("b");
});

test("empty template and missing report reject instead of downloading", async context => {
  context.mock.method(httpClient, "get", async () => ({ data: new Blob([]) }));
  await assert.rejects(downloadApartmentTemplateAction("b"));
  await assert.rejects(downloadApartmentReportAction(null));
});

test("report download decodes bytes and never uses server-provided filenames", async context => {
  const state: { blob: Blob | null } = { blob: null };
  context.mock.method(FileDownloadManager, "download", (blob, name) => {
    assert.equal(name, "apartments-errors.xlsx");
    state.blob = blob;
  });
  await downloadApartmentReportAction("eGxzeA==");
  assert.ok(state.blob);
  assert.equal(await state.blob.text(), "xlsx");
});

test("finish refresh awaits apartment and count queries and propagates refresh failures", async context => {
  const keys: unknown[] = [];
  context.mock.method(queryClient, "invalidateQueries", async (query, options) => {
    keys.push(query.queryKey);
    assert.equal(options.throwOnError, true);
  });
  await refreshImportedApartmentsAction("b");
  assert.ok(keys.some(key => JSON.stringify(key) === JSON.stringify(["apartments", "b"])));
  assert.ok(
    keys.some(key => JSON.stringify(key) === JSON.stringify(["apartment-stage-counts", "b"])),
  );
  context.mock.restoreAll();
  context.mock.method(queryClient, "invalidateQueries", async () => {
    throw new Error("refresh");
  });
  await assert.rejects(refreshImportedApartmentsAction("b"));
});

test("native download cleans its temporary link and object URL on success or click failure", context => {
  const events: string[] = [];
  const state = { failClick: false };
  const link = {
    href: "",
    download: "",
    click: () => {
      events.push("click");
      if (state.failClick) {
        throw new Error("download blocked");
      }
    },
    remove: () => events.push("remove"),
  };
  const hadDocument = Reflect.has(globalThis, "document");
  const originalDocument = Reflect.get(globalThis, "document");
  Reflect.set(globalThis, "document", {
    createElement: () => link,
    body: { appendChild: () => events.push("append") },
  });
  context.mock.method(URL, "createObjectURL", () => "blob:test");
  context.mock.method(URL, "revokeObjectURL", url => {
    assert.equal(url, "blob:test");
    events.push("revoke");
  });
  try {
    FileDownloadManager.download(new Blob(["xlsx"]), "safe.xlsx");
    assert.equal(link.download, "safe.xlsx");
    assert.deepEqual(events, ["append", "click", "remove", "revoke"]);
    state.failClick = true;
    assert.throws(() => FileDownloadManager.download(new Blob(["xlsx"]), "safe.xlsx"));
    assert.deepEqual(events.slice(-2), ["remove", "revoke"]);
  } finally {
    if (hadDocument) {
      Reflect.set(globalThis, "document", originalDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
  }
});

test("import requires all explicit capabilities regardless of role", () => {
  const user = {
    id: "test",
    email: "test@example.com",
    phone: "",
    firstName: "Test",
    lastName: "User",
    employeeNumber: "",
    deletedAt: null,
  };
  const permissions = [
    PERMISSIONS.APARTMENTS_CREATE,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE,
  ];
  for (const role of USER_ROLE_VALUES) {
    assert.equal(canImportApartments({ ...user, role, permissions }), true);
    assert.equal(canImportApartments({ ...user, role, permissions: [] }), false);
    for (const missing of permissions) {
      assert.equal(
        canImportApartments({
          ...user,
          role,
          permissions: permissions.filter(value => value !== missing),
        }),
        false,
      );
    }
  }
  assert.equal(canImportApartments(null), false);
});

test("hook prevents concurrent duplicate uploads and clears in-memory report on close", async context => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const pending = Promise.withResolvers<{ data: typeof response }>();
  const state: {
    requests: number;
    controls: ReturnType<typeof useApartmentImport> | null;
    renderer: ReturnType<typeof create> | null;
  } = { requests: 0, controls: null, renderer: null };
  const Harness = () => {
    state.controls = useApartmentImport("b");
    return null;
  };
  const controls = () => {
    assert.ok(state.controls);
    return state.controls;
  };
  context.mock.method(httpClient, "post", async () => {
    state.requests += 1;
    return pending.promise;
  });
  await act(async () => {
    state.renderer = create(<Harness />);
  });
  await act(async () => {
    controls().openImport();
    const first = controls().selectFiles([file]);
    const second = controls().selectFiles([file]);
    pending.resolve({ data: response });
    await Promise.all([first, second]);
  });
  assert.equal(state.requests, 1);
  assert.equal(controls().view.stage, "results");
  await act(async () => {
    controls().retry();
  });
  assert.equal(controls().view.refreshRequired, true);
  await act(async () => {
    controls().closeImport();
  });
  assert.equal(controls().open, false);
  assert.equal(controls().view.stage, "select");
  await assert.rejects(controls().downloadReport());
  await act(async () => {
    state.renderer?.unmount();
  });
});

test("shared HTTP client attaches bearer authentication to template and import requests", async () => {
  const originalAdapter = httpClient.defaults.adapter;
  const calls: string[] = [];
  setSession({
    accessToken: "fixture-token",
    user: {
      id: "test",
      email: "test@example.com",
      phone: "",
      firstName: "Test",
      lastName: "User",
      employeeNumber: "",
      deletedAt: null,
      role: USER_ROLES.SYSTEM_ADMIN,
      permissions: [],
    },
  });
  httpClient.defaults.adapter = async config => {
    assert.equal(config.headers.get("Authorization"), "Bearer fixture-token");
    calls.push(config.url ?? "");
    const data = config.responseType === "blob" ? new Blob(["template"]) : response;
    return { data, status: 200, statusText: "OK", headers: {}, config };
  };
  try {
    await apartmentImportService.template("b");
    await apartmentImportService.upload({ file, buildingId: "b", onProgress: () => {} });
    assert.deepEqual(calls, [
      "/project/b/apartments/import/template",
      "/project/b/apartments/import",
    ]);
  } finally {
    httpClient.defaults.adapter = originalAdapter;
    setSession(null);
  }
});

test("commercial display preserves zero and exact decimal credit distinct from missing values", () => {
  assert.equal(formatApartmentCredit(null), "לא הוזן");
  assert.equal(formatApartmentCredit("0.00"), "0.00 ₪");
  assert.equal(formatApartmentCredit("123456789012.34"), "123456789012.34 ₪");
  assert.equal(formatApartmentOwnership("landowner"), "בעל קרקע בתמ״א");
  assert.equal(formatApartmentOwnership("buyer"), "רוכש");
  assert.equal(formatApartmentOwnership(null), "לא הוגדר");
  assert.equal(isApartmentCredit("-1"), false);
  assert.equal(isApartmentCredit("1.234"), false);
  assert.equal(isApartmentCredit("0"), true);
  assert.equal(isApartmentOwnership("other"), false);
});

test("known import API errors are localized without exposing server messages", async context => {
  const views: TApartmentImportView[] = [];
  const config = { headers: new AxiosHeaders() };
  context.mock.method(httpClient, "post", async () => {
    throw new AxiosError("missing", "ERR_BAD_REQUEST", config, null, {
      config,
      status: 404,
      statusText: "Not Found",
      headers: {},
      data: {
        code: "APARTMENT_IMPORT_BUILDING_NOT_FOUND",
        message: "Internal building identifier",
      },
    });
  });
  await startApartmentImportAction({
    file,
    buildingId: "b",
    setView: view => views.push(view),
    setReport: () => {},
  });
  assert.equal(views.at(-1)?.failure?.message, "הבניין שנבחר לא נמצא");
  assert.equal(views.at(-1)?.failure?.code, "APARTMENT_IMPORT_BUILDING_NOT_FOUND");
});

test("import completion invalidates cached customer details and contacts", async () => {
  const contactKey = [CUSTOMER_CONTACT_QUERY_ROOT, "cached-customer"];
  const customerKey = QUERY_KEYS.customer("cached-customer");
  queryClient.setQueryData(contactKey, [{ id: "old-contact" }]);
  queryClient.setQueryData(customerKey, { id: "cached-customer" });
  assert.equal(queryClient.getQueryState(contactKey)?.isInvalidated, false);
  await refreshImportedApartmentsAction("building-1");
  assert.equal(queryClient.getQueryState(contactKey)?.isInvalidated, true);
  assert.equal(queryClient.getQueryState(customerKey)?.isInvalidated, true);
  queryClient.removeQueries({ queryKey: contactKey });
  queryClient.removeQueries({ queryKey: customerKey });
});
