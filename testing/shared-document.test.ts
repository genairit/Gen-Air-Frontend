import { test } from "node:test";
import { createElement } from "react";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../src/providers/query-client";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { isApiSharedDocument } from "../src/utilities/guards/api.guard";
import { selectSharedDocumentAction } from "../src/actions/drive.action";
import { projectActivityService } from "../src/services/project-activity.service";
import SharedProjectDocumentCard from "../src/pages/apartment/components/SharedProjectDocumentCard";

test("a selected parent file requires a safe Drive viewer URL", () => {
  const file = {
    id: "plan-file",
    name: "תוכנית ביצוע.pdf",
    url: "https://drive.google.com/open?id=plan-file",
  };
  assert.equal(isApiSharedDocument({ status: "available", file }), true);
  assert.equal(
    isApiSharedDocument({ status: "available", file: { ...file, url: "javascript:alert(1)" } }),
    false,
  );
  assert.equal(
    isApiSharedDocument({
      status: "available",
      file: { ...file, url: "https://evil.example/open" },
    }),
    false,
  );
});

test("missing and unavailable selections cannot carry a stale link", () => {
  assert.equal(isApiSharedDocument({ status: "none", file: null }), true);
  assert.equal(isApiSharedDocument({ status: "unavailable", file: null }), true);
  assert.equal(
    isApiSharedDocument({
      status: "unavailable",
      file: { id: "old", name: "old", url: "https://drive.google.com/open?id=old" },
    }),
    false,
  );
});

test("selection and clear invalidate the parent, apartment, and project caches", async context => {
  const parentId = "parent-1";
  const apartmentId = "apartment-1";
  const calls: Array<string | null> = [];
  context.mock.method(
    projectActivityService,
    "selectSharedDocument",
    async (_projectId, fileId) => {
      calls.push(fileId);
      return { status: "none" as const, file: null };
    },
  );
  queryClient.setQueryData(QUERY_KEYS.sharedDocument(parentId), { status: "none", file: null });
  queryClient.setQueryData(QUERY_KEYS.sharedDocument(apartmentId), { status: "none", file: null });
  queryClient.setQueryData(QUERY_KEYS.project(parentId), { id: parentId });

  await selectSharedDocumentAction({ projectId: parentId, fileId: "plan-file" });
  assert.deepEqual(calls, ["plan-file"]);
  assert.equal(queryClient.getQueryState(QUERY_KEYS.sharedDocument(parentId))?.isInvalidated, true);
  assert.equal(
    queryClient.getQueryState(QUERY_KEYS.sharedDocument(apartmentId))?.isInvalidated,
    true,
  );
  assert.equal(queryClient.getQueryState(QUERY_KEYS.project(parentId))?.isInvalidated, true);

  await selectSharedDocumentAction({ projectId: parentId, fileId: null });
  assert.deepEqual(calls, ["plan-file", null]);
  queryClient.clear();
});

test("apartment card renders only the validated link and actionable unavailable state", () => {
  const apartmentId = "apartment-2";
  const key = QUERY_KEYS.sharedDocument(apartmentId);
  const render = () =>
    renderToStaticMarkup(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(SharedProjectDocumentCard, { apartmentId }),
      ),
    );
  queryClient.setQueryData(key, {
    status: "available",
    file: {
      id: "plan-file",
      name: "תוכנית ביצוע.pdf",
      url: "https://drive.google.com/open?id=plan-file",
    },
  });
  const available = render();
  assert.ok(available.includes("https://drive.google.com/open?id=plan-file"));
  assert.ok(available.includes("פתח מסמך משותף ב-Drive"));

  queryClient.setQueryData(key, { status: "unavailable", file: null });
  const unavailable = render();
  assert.ok(unavailable.includes("פנו לעורך פרויקט האב"));
  assert.equal(unavailable.includes("https://drive.google.com/open?id=plan-file"), false);
  queryClient.clear();
});
