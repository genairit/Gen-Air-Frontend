import ts from "typescript";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && context.parentURL) {
      for (const suffix of [".ts", "/index.ts"]) {
        const url = new URL(specifier + suffix, context.parentURL);
        if (existsSync(url)) {
          return { url: url.href, shortCircuit: true };
        }
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

const { taskService } = await import("../src/services/task.service.ts");
const { updateTaskStatusAction } = await import("../src/actions/task.action.ts");
const { queryClient } = await import("../src/providers/query-client.ts");
const { QUERY_KEYS, QUERY_ROOTS } = await import("../src/constants/query-key.constant.ts");
const { QueryObserver } = await import("@tanstack/react-query");

const sample = {
  id: "task-1",
  title: "Task",
  projectId: "project-1",
  customerId: "customer-1",
  createdById: "manager-1",
  assigneeId: null,
  description: null,
  dueDate: null,
  isUrgent: false,
  status: "not_started",
  urgencyMarkedById: null,
  urgencyMarkedAt: null,
  createdAt: "2026-10-14T00:00:00Z",
  updatedAt: "2026-10-14T00:00:00Z",
  deletedAt: null,
};

const deferred = () => {
  const callbacks = {};
  const promise = new Promise((resolve, reject) => Object.assign(callbacks, { resolve, reject }));
  return {
    promise,
    resolve: value => callbacks.resolve(value),
    reject: error => callbacks.reject(error),
  };
};
const personalKey = QUERY_KEYS.myTasks("worker", { status: "not_started" });
const projectKey = QUERY_KEYS.tasks({ projectId: "project-1" });
const other = { ...sample, id: "task-2" };
const pageData = () => ({
  pages: [
    { items: [other], nextCursor: "cursor-1" },
    { items: [sample], nextCursor: null },
  ],
  pageParams: [null, "cursor-1"],
});
const readTask = key => queryClient.getQueryData(key).pages[1].items[0];
const seed = () => {
  queryClient.clear();
  queryClient.setQueryData(QUERY_KEYS.task(sample.id), sample);
  queryClient.setQueryData(personalKey, pageData());
  queryClient.setQueryData(projectKey, pageData());
};
const turn = () => new Promise(resolve => setImmediate(resolve));

test("status updates every loaded page and detail before response; retains filtered rows and refreshes real counts", async () => {
  seed();
  const response = deferred();
  const originalUpdate = taskService.updateStatus;
  taskService.updateStatus = () => response.promise;
  const counts = { total: 2, urgent: 0, byStatus: {} };
  const reads = { counts: 0, lists: 0 };
  const countsObserver = new QueryObserver(queryClient, {
    queryKey: QUERY_KEYS.myTaskCounts("worker"),
    initialData: counts,
    queryFn: async () => {
      reads.counts += 1;
      return { ...counts, total: 3 };
    },
  });
  const listObserver = new QueryObserver(queryClient, {
    queryKey: personalKey,
    queryFn: async () => {
      reads.lists += 1;
      return { pages: [], pageParams: [] };
    },
  });
  const unsubscribeCounts = countsObserver.subscribe(() => {});
  const unsubscribeList = listObserver.subscribe(() => {});
  try {
    const pending = updateTaskStatusAction({ taskId: sample.id, status: "in_progress" });
    await turn();
    assert.equal(queryClient.getQueryData(QUERY_KEYS.task(sample.id)).status, "in_progress");
    for (const key of [personalKey, projectKey]) {
      assert.equal(readTask(key).status, "in_progress");
      assert.equal(queryClient.getQueryData(key).pages[0].items[0].status, "not_started");
      assert.deepEqual(queryClient.getQueryData(key).pageParams, [null, "cursor-1"]);
    }
    assert.equal(reads.counts, 0);
    assert.equal(reads.lists, 0);
    response.resolve({ ...sample, status: "in_progress", updatedAt: "server-time" });
    await pending;
    assert.equal(readTask(personalKey).updatedAt, "server-time");
    assert.equal(readTask(personalKey).id, sample.id);
    assert.equal(reads.lists, 0);
    assert.equal(reads.counts, 1);
    assert.equal(queryClient.getQueryState(personalKey).isInvalidated, true);
    await queryClient.refetchQueries({ queryKey: personalKey, exact: true });
    assert.equal(reads.lists, 1);
    assert.deepEqual(queryClient.getQueryData(personalKey).pages, []);
  } finally {
    unsubscribeCounts();
    unsubscribeList();
    taskService.updateStatus = originalUpdate;
    queryClient.clear();
  }
});

test("rejection rolls back only the changed task status, preserving concurrent edits and another task's success", async () => {
  seed();
  const first = deferred();
  const second = deferred();
  const originalUpdate = taskService.updateStatus;
  taskService.updateStatus = taskId => (taskId === sample.id ? first.promise : second.promise);
  try {
    const failed = updateTaskStatusAction({ taskId: sample.id, status: "in_progress" });
    const succeeded = updateTaskStatusAction({ taskId: other.id, status: "in_review" });
    await turn();
    queryClient.setQueryData(QUERY_KEYS.task(sample.id), current => ({
      ...current,
      title: "Edited title",
    }));
    queryClient.setQueryData(personalKey, current => ({
      ...current,
      pages: current.pages.map(page => ({
        ...page,
        items: page.items.map(task => ({ ...task, isUrgent: true })),
      })),
    }));
    second.resolve({ ...other, status: "in_review" });
    await succeeded;
    first.reject(new Error("Permission denied"));
    await assert.rejects(failed, /Permission denied/);
    assert.equal(queryClient.getQueryData(QUERY_KEYS.task(sample.id)).status, "not_started");
    assert.equal(queryClient.getQueryData(QUERY_KEYS.task(sample.id)).title, "Edited title");
    for (const key of [personalKey, projectKey]) {
      assert.equal(readTask(key).status, "not_started");
      assert.equal(queryClient.getQueryData(key).pages[0].items[0].status, "in_review");
    }
    assert.equal(readTask(personalKey).isUrgent, true);
  } finally {
    taskService.updateStatus = originalUpdate;
    queryClient.clear();
  }
});

test("uncached tasks do not create partial details or phantom lists", async () => {
  queryClient.clear();
  const originalUpdate = taskService.updateStatus;
  taskService.updateStatus = async () => ({ ...sample, status: "in_review" });
  try {
    await updateTaskStatusAction({ taskId: sample.id, status: "in_review" });
    assert.equal(queryClient.getQueryData(QUERY_KEYS.task(sample.id)) == null, true);
    assert.deepEqual(queryClient.getQueriesData({ queryKey: [QUERY_ROOTS.TASKS] }), []);
  } finally {
    taskService.updateStatus = originalUpdate;
    queryClient.clear();
  }
});
