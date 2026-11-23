import {
  toExistingDriveFolder,
  existingDriveFolderPayload,
  formatMissingTemplateFolders,
} from "../src/utilities/existing-drive-folder.utility";

import {
  DRIVE_FOLDER_LINK_ERROR_COPY,
  DRIVE_FOLDER_LINK_ERROR_MESSAGES,
} from "../src/constants/existing-drive-folder.constant";

import type {
  IExistingDriveFolderState,
  IExistingDriveFolderPreview,
} from "../src/interfaces/existing-drive-folder.interface";

import {
  getProjectMutationError,
  getExistingDriveFolderError,
} from "../src/utilities/existing-drive-folder-error.utility";

import { test } from "node:test";
import { createElement } from "react";
import assert from "node:assert/strict";
import { AxiosError, AxiosHeaders } from "axios";
import { act, create } from "react-test-renderer";
import { project } from "./project-tasks.fixture";
import { renderToStaticMarkup } from "react-dom/server";
import { deferred } from "./project-constraints.fixture";
import { TIME_UNITS } from "../src/constants/time.constant";
import { queryClient } from "../src/providers/query-client";
import { httpClient } from "../src/services/http-client.service";
import { projectService } from "../src/services/project.service";
import { QUERY_ROOTS } from "../src/constants/query-key.constant";
import RadioButton from "../src/components/RadioButton/RadioButton";
import { createProjectAction } from "../src/actions/project.action";
import { SEARCH_DEBOUNCE_MS } from "../src/constants/search.constant";
import { toProjectFormValues } from "../src/utilities/project.utility";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useExistingDriveFolder } from "../src/hooks/existing-drive-folder.hook";
import { completeProjectDriveTemplateAction } from "../src/actions/drive.action";
import { projectActivityService } from "../src/services/project-activity.service";
import { DRIVE_FOLDER_MODES } from "../src/constants/existing-drive-folder.constant";
import { isExistingDriveFolderPreview } from "../src/utilities/guards/existing-drive-folder.guard";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

const folder: IExistingDriveFolderPreview = {
  id: "existing-folder",
  name: "פרויקט ותיק",
  missingTemplateFolders: ["הצעות מחיר"],
};
const flush = async (): Promise<void> => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, TIME_UNITS.SECOND_MS / 100));
  });
};
const debounce = async (): Promise<void> => {
  await act(async () => {
    await new Promise(resolve =>
      setTimeout(resolve, SEARCH_DEBOUNCE_MS + TIME_UNITS.SECOND_MS / 100),
    );
  });
};

test("existing folder preview validates identity, name and required missing-folder metadata", () => {
  assert.equal(isExistingDriveFolderPreview(folder), true);
  assert.equal(isExistingDriveFolderPreview({ ...folder, missingTemplateFolders: [] }), true);
  assert.equal(isExistingDriveFolderPreview({ id: folder.id, name: folder.name }), false);
  assert.equal(isExistingDriveFolderPreview({ ...folder, id: "" }), false);
  assert.equal(isExistingDriveFolderPreview({ ...folder, missingTemplateFolders: [null] }), false);
});

test("new mode omits existing-folder payload and stale previews cannot authorize submission", () => {
  assert.equal(
    formatMissingTemplateFolders(["private-path-A", "private-path-B"]),
    "חסרות 2 תיקיות מהתבנית",
  );
  assert.deepEqual(existingDriveFolderPayload(null), {});
  assert.deepEqual(existingDriveFolderPayload(folder.id), { existingDriveFolder: folder.id });
  assert.equal(
    toExistingDriveFolder({ mode: DRIVE_FOLDER_MODES.NEW, isCurrent: true, preview: folder }),
    null,
  );
  assert.equal(
    toExistingDriveFolder({ mode: DRIVE_FOLDER_MODES.EXISTING, isCurrent: false, preview: folder }),
    null,
  );
  assert.equal(
    toExistingDriveFolder({ mode: DRIVE_FOLDER_MODES.EXISTING, isCurrent: true, preview: folder }),
    folder.id,
  );
});

test("preview service forwards apartment scope and cancellation and rejects malformed responses", async context => {
  const controller = new AbortController();
  const post = context.mock.method(httpClient, "post", async (url, body, config) => {
    assert.equal(url, "/project-drive/existing-folder/preview");
    assert.deepEqual(body, { reference: "a-folder-link", buildingId: "building-1" });
    assert.equal(config?.signal, controller.signal);
    return { data: folder };
  });
  assert.deepEqual(
    await projectActivityService.previewExistingDriveFolder(
      "a-folder-link",
      "building-1",
      controller.signal,
    ),
    folder,
  );
  post.mock.mockImplementation(async () => ({ data: { id: "folder" } }));
  await assert.rejects(() =>
    projectActivityService.previewExistingDriveFolder("folder", null, controller.signal),
  );
});

test("project create persists the validated existing folder in the initial creation request", async context => {
  const createProject = context.mock.method(projectService, "create", async input => {
    assert.equal(input.existingDriveFolder, folder.id);
    return { ...project, driveFolderId: folder.id, driveFolderLinked: true };
  });
  const id = await createProjectAction({
    values: toProjectFormValues(project),
    canHaveApartments: false,
    fieldSet: null,
    originalIntake: null,
    existingDriveFolder: folder.id,
  });
  assert.equal(id, project.id);
  assert.equal(createProject.mock.callCount(), 1);
});

test("template completion is explicit, refreshes only after success and preserves failures", async context => {
  const complete = context.mock.method(
    projectActivityService,
    "completeDriveTemplate",
    async () => project,
  );
  const invalidate = context.mock.method(queryClient, "invalidateQueries", async input => {
    assert.deepEqual(input?.queryKey, [QUERY_ROOTS.PROJECT_DRIVE, project.id]);
  });
  await completeProjectDriveTemplateAction(project.id);
  assert.equal(complete.mock.callCount(), 1);
  assert.equal(invalidate.mock.callCount(), 1);
  complete.mock.mockImplementation(async () => {
    throw new Error("Drive unavailable");
  });
  await assert.rejects(() => completeProjectDriveTemplateAction(project.id), /Drive unavailable/);
  assert.equal(invalidate.mock.callCount(), 1);
});

test("debounced preview blocks empty, pending, stale and failed selection then retries and resets", async context => {
  const state: { current: IExistingDriveFolderState | null } = { current: null };
  const current = (): IExistingDriveFolderState => {
    assert.ok(state.current);
    return state.current;
  };
  const first = deferred<IExistingDriveFolderPreview>();
  const stale = deferred<IExistingDriveFolderPreview>();
  const calls: string[] = [];
  context.mock.method(
    projectActivityService,
    "previewExistingDriveFolder",
    async (reference, buildingId) => {
      assert.equal(buildingId, "building-1");
      calls.push(reference);
      const responses: Record<string, () => Promise<IExistingDriveFolderPreview>> = {
        "folder-A": async () => first.promise,
        "folder-B": async () => stale.promise,
        "folder-C": async () => {
          if (calls.filter(call => call === "folder-C").length === 1) {
            throw new Error("No folder access");
          }

          return { ...folder, id: "folder-C" };
        },
      };
      const respond = responses[reference];
      assert.ok(respond);
      return respond();
    },
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const Probe = () => {
    state.current = useExistingDriveFolder("building-1");
    return null;
  };
  const renderer = await act(async () =>
    create(createElement(QueryClientProvider, { client }, createElement(Probe))),
  );
  try {
    assert.equal(current().canSubmit, true);
    assert.equal(calls.length, 0);
    await act(async () => current().setMode(DRIVE_FOLDER_MODES.EXISTING));
    assert.equal(current().canSubmit, false);
    await act(async () => current().setReference("folder-A"));
    assert.equal(calls.length, 0);
    await debounce();
    assert.equal(current().isPending, true);
    await act(async () => first.resolve(folder));
    await flush();
    assert.equal(current().existingDriveFolder, folder.id);
    await act(async () => current().setReference("folder-B"));
    assert.equal(current().canSubmit, false);
    await debounce();
    await act(async () => current().setReference("folder-C"));
    await act(async () => stale.resolve({ ...folder, id: "folder-B" }));
    await flush();
    assert.equal(current().preview, null);
    assert.equal(current().canSubmit, false);
    await debounce();
    await flush();
    assert.ok(current().error);
    assert.equal(current().reference, "folder-C");
    assert.equal(current().canSubmit, false);
    await act(async () => current().retry());
    await flush();
    assert.equal(current().existingDriveFolder, "folder-C");
    assert.equal(current().canSubmit, true);
    await act(async () => current().reset());
    assert.equal(current().mode, DRIVE_FOLDER_MODES.NEW);
    assert.equal(current().reference, "");
    assert.equal(current().existingDriveFolder, null);
    assert.equal(current().canSubmit, true);
  } finally {
    await act(async () => renderer.unmount());
    client.clear();
  }
});

test("radio choices keep native labels/group names and propagate disabled state without changing existing defaults", () => {
  const disabled = renderToStaticMarkup(
    createElement(RadioButton, {
      label: "קישור לתיקייה קיימת",
      name: "drive-mode",
      value: DRIVE_FOLDER_MODES.EXISTING,
      checked: true,
      disabled: true,
      onSelect: () => {},
    }),
  );
  assert.match(disabled, /type="radio"/);
  assert.match(disabled, /name="drive-mode"/);
  assert.match(disabled, /disabled=""/);
  assert.match(disabled, /קישור לתיקייה קיימת/);
  const enabled = renderToStaticMarkup(
    createElement(RadioButton, { label: "יצירת תיקייה חדשה", checked: false, onSelect: () => {} }),
  );
  assert.doesNotMatch(enabled, /disabled=""/);
});

test("folder errors are actionable Hebrew messages and never expose raw provider credentials", () => {
  const error = new AxiosError("private-google-key-error");
  for (const [code, message] of Object.entries(DRIVE_FOLDER_LINK_ERROR_MESSAGES)) {
    error.response = {
      status: 400,
      statusText: "Bad Request",
      data: { code, message: "private-google-key-error" },
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    };
    assert.equal(getExistingDriveFolderError(error), message);
    assert.equal(getProjectMutationError(error), message);
  }
  error.response = {
    status: 500,
    statusText: "Failure",
    data: { code: "unknown", message: "private-google-key-error" },
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
  assert.equal(getExistingDriveFolderError(error), DRIVE_FOLDER_LINK_ERROR_COPY.UNAVAILABLE);
  error.response.status = 403;
  assert.equal(getExistingDriveFolderError(error), DRIVE_FOLDER_LINK_ERROR_COPY.UNAUTHORIZED);
});
