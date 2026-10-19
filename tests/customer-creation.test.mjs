import ts from "typescript";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";

registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "moment/dist/locale/he") {
      return next("moment/locale/he.js", context);
    }

    if (specifier.startsWith(".") && context.parentURL) {
      const matchingUrl = [".ts", "/index.ts"]
        .map(suffix => new URL(specifier + suffix, context.parentURL))
        .find(url => existsSync(url));
      if (matchingUrl) {
        return { url: matchingUrl.href, shortCircuit: true };
      }
    }

    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".ts")) {
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(
          readFileSync(fileURLToPath(url), "utf8").replaceAll("import.meta.env", "({})"),
          {
            compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
          },
        ).outputText,
      };
    }

    return next(url, context);
  },
});

const { normalizeCustomerForm, getCustomerFormErrors, countCustomerFormErrors } =
  await import("../src/utilities/customer-form.utility.ts");
const { customerService } = await import("../src/services/customer.service.ts");
const { createCustomerAction } = await import("../src/actions/customer.action.ts");
const { httpClient } = await import("../src/services/http-client.service.ts");
const { queryClient } = await import("../src/providers/query-client.ts");
const { QUERY_KEYS, QUERY_ROOTS } = await import("../src/constants/query-key.constant.ts");
const { hasPermission } = await import("../src/utilities/permission.utility.ts");
const { isCustomerSelectable } = await import("../src/utilities/customer.utility.ts");
const payload = {
  name: "לקוח לבדיקה",
  taxId: "123456782",
  address: "רחוב הרצל 1 תל אביב",
  contactName: "ישראל ישראלי",
  phone: "052-1234567",
  email: "customer@example.com",
  customerType: "company",
};
const customer = {
  ...payload,
  id: "new-customer",
  createdAt: "2026-10-17T00:00:00Z",
  priorityId: null,
  prioritySyncStatus: "pending",
  prioritySyncAttempts: 0,
  prioritySyncedAt: null,
  prioritySyncError: null,
};
const fixture = { response: customer, error: null, requests: [], invalidations: [] };
httpClient.defaults.adapter = async config => {
  fixture.requests.push({
    url: config.url,
    method: config.method,
    payload: config.data ? JSON.parse(config.data) : null,
  });
  if (fixture.error) {
    throw fixture.error;
  }

  return { data: fixture.response, status: 201, statusText: "Created", headers: {}, config };
};
queryClient.invalidateQueries = async options => {
  fixture.invalidations.push(options.queryKey);
};

test("customer form trims every text field and sends no Priority-controlled fields", () => {
  const padded = Object.fromEntries(
    Object.entries(payload).map(([field, value]) => [field, `  ${value}  `]),
  );
  padded.customerType = payload.customerType;
  const normalized = normalizeCustomerForm({
    ...padded,
    priorityId: "forged",
    prioritySyncStatus: "synced",
  });
  assert.deepEqual(normalized, payload);
  assert.equal(padded.name.startsWith("  "), true);
  assert.deepEqual(getCustomerFormErrors(padded), {});
});

test("every identity and contact field is required and every supported customer type is valid", () => {
  const requiredFields = ["name", "taxId", "address", "contactName", "phone", "email"];
  for (const field of requiredFields) {
    const errors = getCustomerFormErrors({ ...payload, [field]: "   " });
    assert.deepEqual(Object.keys(errors), [field]);
    assert.ok(errors[field]);
  }
  for (const customerType of ["company", "private_client", "institution"]) {
    assert.deepEqual(getCustomerFormErrors({ ...payload, customerType }), {});
  }
  for (const customerType of ["", "unknown", null]) {
    assert.deepEqual(Object.keys(getCustomerFormErrors({ ...payload, customerType })), [
      "customerType",
    ]);
  }
});

test("error count drives the fields-to-fix banner and is zero for a valid form", () => {
  const emptyForm = {
    ...payload,
    name: "",
    taxId: "",
    address: "",
    contactName: "",
    phone: "",
    email: "",
  };
  assert.equal(countCustomerFormErrors(emptyForm), 6);
  assert.equal(countCustomerFormErrors({ ...payload, phone: "123" }), 1);
  assert.equal(countCustomerFormErrors(payload), 0);
});

test("tax IDs require nine digits and a valid check digit", () => {
  for (const taxId of ["12345678", "1234567890", "123456781", "12345678a"]) {
    assert.ok(getCustomerFormErrors({ ...payload, taxId }).taxId);
  }
  assert.deepEqual(getCustomerFormErrors({ ...payload, taxId: "123456782" }), {});
});

test("contact validation supports Israeli landlines and mobiles and rejects malformed contacts", () => {
  for (const phone of ["03-1234567", "031234567", "052-1234567", "0521234567"]) {
    assert.deepEqual(getCustomerFormErrors({ ...payload, phone }), {});
  }
  for (const phone of ["123", "052-123", "+1-555-123-4567", "phone"]) {
    assert.ok(getCustomerFormErrors({ ...payload, phone }).phone);
  }
  for (const email of ["missing-at.example.com", "two words@example.com", "a@", "@example.com"]) {
    assert.ok(getCustomerFormErrors({ ...payload, email }).email);
  }
});

test("form rejects overlong identity and contact inputs", () => {
  const oversized = {
    name: "א".repeat(201),
    address: "א".repeat(201),
    contactName: "א".repeat(121),
    email: `${"a".repeat(243)}@example.com`,
    phone: "0".repeat(21),
  };
  for (const [field, value] of Object.entries(oversized)) {
    assert.ok(getCustomerFormErrors({ ...payload, [field]: value })[field], field);
  }
});

test("customer creation POST returns a validated pending customer and rejects malformed responses", async () => {
  fixture.response = customer;
  assert.deepEqual(await customerService.create(payload), customer);
  assert.deepEqual(fixture.requests.at(-1), { url: "/customer", method: "post", payload });
  for (const response of [
    { id: "only-id" },
    { ...customer, prioritySyncStatus: "unknown" },
    { ...customer, customerType: "unknown" },
  ]) {
    fixture.response = response;
    await assert.rejects(customerService.create(payload), /Unexpected response shape/);
  }
  fixture.response = customer;
});

test("successful creation caches the returned detail, refreshes list and counts, and returns navigation ID", async () => {
  fixture.invalidations.length = 0;
  queryClient.removeQueries({ queryKey: QUERY_KEYS.customer(customer.id) });
  fixture.response = { ...customer, name: "Server normalized name" };
  assert.equal(await createCustomerAction(payload), customer.id);
  assert.deepEqual(queryClient.getQueryData(QUERY_KEYS.customer(customer.id)), fixture.response);
  assert.deepEqual(fixture.invalidations, [
    [QUERY_ROOTS.CUSTOMERS],
    QUERY_KEYS.CUSTOMER_SYNC_STATUS_COUNTS,
  ]);
  fixture.response = customer;
});

test("duplicate conflict and transport failure propagate without caching success or returning navigation ID", async () => {
  for (const error of [
    Object.assign(new Error("Duplicate tax ID"), { response: { status: 409 } }),
    new Error("Network unavailable"),
  ]) {
    fixture.error = error;
    fixture.invalidations.length = 0;
    queryClient.removeQueries({ queryKey: QUERY_KEYS.customer(customer.id) });
    try {
      await assert.rejects(createCustomerAction(payload), caught => caught === error);
      assert.equal(queryClient.getQueryData(QUERY_KEYS.customer(customer.id)) == null, true);
      assert.deepEqual(fixture.invalidations, []);
    } finally {
      fixture.error = null;
    }
  }
});

test("customer creation is management-only and pending CRM customers remain selectable for projects", () => {
  assert.equal(hasPermission({ role: "system_admin" }, "MANAGE_CUSTOMERS"), true);
  for (const role of ["engineer", "secretary", "project_manager", "finance", "installer"]) {
    assert.equal(hasPermission({ role }, "MANAGE_CUSTOMERS"), false);
  }
  assert.equal(hasPermission(null, "MANAGE_CUSTOMERS"), false);
  assert.equal(isCustomerSelectable(customer), true);
  assert.equal(isCustomerSelectable({ ...customer, prioritySyncStatus: "failed" }), false);
});
