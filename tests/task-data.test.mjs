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
        if (existsSync(url)) return { url: url.href, shortCircuit: true };
      }
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".ts"))
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
    return next(url, context);
  },
});

const { taskService } = await import("../src/services/task.service.ts");
const { httpClient } = await import("../src/services/http-client.service.ts");
const { isApiTask, isTaskCounts } = await import("../src/utilities/guards/task.guard.ts");
const { createTaskAction, updateTaskUrgencyAction } = await import("../src/actions/task.action.ts");
const { queryClient } = await import("../src/providers/query-client.ts");
const { QUERY_KEYS } = await import("../src/constants/query-key.constant.ts");
const { hasPermission } = await import("../src/utilities/permission.utility.ts");
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
const fixture = { response: sample, error: null, requests: [], invalidations: [] };
httpClient.defaults.adapter = async config => {
  fixture.requests.push({
    url: config.url,
    method: config.method,
    params: config.params,
    payload: config.data ? JSON.parse(config.data) : null,
  });
  if (fixture.error) throw fixture.error;
  return { data: fixture.response, status: 200, statusText: "OK", headers: {}, config };
};
queryClient.invalidateQueries = async options => {
  fixture.invalidations.push(options.queryKey);
};

test("task guards accept legacy nulls and reject malformed task/status/count contracts", () => {
  assert.equal(isApiTask(sample), true);
  assert.equal(isApiTask({ ...sample, status: "unknown" }), false);
  assert.equal(isApiTask({ ...sample, urgencyMarkedById: 123 }), false);
  assert.equal(isApiTask({ ...sample, assigneeId: {} }), false);
  assert.equal(isApiTask({ ...sample, projectId: null }), true);
  assert.equal(isApiTask({ ...sample, customerId: null }), true);
  assert.equal(
    isApiTask({
      ...sample,
      customerId: null,
      project: { id: "project-1", code: "GA-1", name: "P", customer: { id: "c", name: "C" } },
    }),
    true,
  );
  assert.equal(
    isApiTask({ ...sample, project: { id: "project-1", code: "GA-1", name: "P", customer: 7 } }),
    false,
  );
  const building = { id: "b", code: "GA-1", name: "B", customer: { id: "c", name: "C" } };
  const apartment = { id: "a", code: "GA-2", name: "A", customer: null };
  assert.equal(isApiTask({ ...sample, project: { ...apartment, parentProject: building } }), true);
  assert.equal(
    isApiTask({ ...sample, project: { ...apartment, parentProject: { id: "b" } } }),
    false,
  );
  const counts = {
    total: 1,
    urgent: 0,
    byStatus: {
      waiting_for_response: 0,
      not_started: 1,
      in_progress: 0,
      in_review: 0,
      proposal_sent: 0,
    },
  };
  assert.equal(isTaskCounts(counts), true);
  assert.equal(isTaskCounts({ ...counts, total: -1 }), false);
  assert.equal(isTaskCounts({ ...counts, byStatus: {} }), false);
});

test("task list preserves cursor metadata and passes server cursors to subsequent pages", async () => {
  fixture.response = { items: [sample], nextCursor: "opaque-server-cursor" };
  const page = await taskService.getByFilter({ projectId: "project-1", isUrgent: false });
  assert.equal(page.nextCursor, "opaque-server-cursor");
  await taskService.getByFilter({ projectId: "project-1" }, page.nextCursor);
  assert.equal(fixture.requests.at(-1).params.batchCursor, "opaque-server-cursor");
  fixture.response = { items: [{ ...sample, status: "invalid" }], nextCursor: null };
  await assert.rejects(taskService.getByFilter({}), /Unexpected response shape/);
});

test("counts strip selected tabs and use a cache key based on base filters", async () => {
  const counts = {
    total: 0,
    urgent: 0,
    byStatus: {
      waiting_for_response: 0,
      not_started: 0,
      in_progress: 0,
      in_review: 0,
      proposal_sent: 0,
    },
  };
  fixture.response = counts;
  const query = { projectId: "project-1", status: "in_review", isUrgent: true, unassigned: false };
  await taskService.getCounts(query);
  assert.equal("status" in fixture.requests.at(-1).params, false);
  assert.equal("isUrgent" in fixture.requests.at(-1).params, false);
  assert.deepEqual(
    QUERY_KEYS.taskCounts(query),
    QUERY_KEYS.taskCounts({ ...query, status: "not_started", isUrgent: false }),
  );
});

test("creation and urgency use separate requests and successful writes invalidate task caches", async () => {
  fixture.response = sample;
  fixture.invalidations.length = 0;
  const payload = {
    title: "Task",
    description: "Description",
    projectId: "project-1",
    assigneeId: null,
    dueDate: "2099-01-01",
  };
  const requestCount = fixture.requests.length;
  await createTaskAction({ payload, isUrgent: false });
  assert.equal(fixture.requests.length, requestCount + 1);
  assert.equal(fixture.requests.at(-1).url, "/task");
  assert.deepEqual(fixture.requests.at(-1).payload, payload);
  assert.equal(fixture.invalidations.length, 4);
  await updateTaskUrgencyAction({ taskId: "task-1", isUrgent: true });
  assert.equal(fixture.requests.at(-1).url, "/task/task-1/urgency");
  assert.deepEqual(fixture.requests.at(-1).payload, { isUrgent: true });
  assert.equal(fixture.invalidations.length, 8);
});

test("creating an urgent task marks it urgent right after it is created", async () => {
  fixture.response = sample;
  fixture.invalidations.length = 0;
  const payload = {
    title: "Urgent task",
    description: "Description",
    projectId: "project-1",
    assigneeId: null,
    dueDate: "2099-01-01",
  };
  await createTaskAction({ payload, isUrgent: true });
  assert.equal(fixture.requests.at(-2).url, "/task");
  assert.equal(fixture.requests.at(-1).url, `/task/${sample.id}/urgency`);
  assert.deepEqual(fixture.requests.at(-1).payload, { isUrgent: true });
  assert.equal(fixture.invalidations.length, 4);
});

test("failed writes are surfaced without claiming a saved task or refreshing caches", async () => {
  fixture.error = new Error("API denied request");
  fixture.invalidations.length = 0;
  await assert.rejects(
    updateTaskUrgencyAction({ taskId: "task-1", isUrgent: true }),
    /API denied request/,
  );
  assert.equal(fixture.invalidations.length, 0);
  fixture.error = null;
});

test("task controls consume independently granted creation and status permissions", () => {
  const creator = { role: "secretary", permissions: ["tasks.create"] };
  const engineer = { role: "engineer", permissions: ["tasks.status.update"] };

  assert.equal(hasPermission(creator, "tasks.create"), true);
  assert.equal(hasPermission(creator, "tasks.status.update"), false);
  assert.equal(hasPermission(engineer, "tasks.status.update"), true);
  assert.equal(hasPermission(engineer, "tasks.create"), false);
  assert.equal(hasPermission({ role: "system_admin", permissions: [] }, "tasks.create"), false);
  assert.equal(hasPermission(null, "tasks.create"), false);
});

test("personal tasks keep search, tabs and cursor pagination on the caller-scoped endpoint", async () => {
  const before = fixture.requests.length;
  fixture.response = { items: [sample], nextCursor: "personal-next-page" };
  const page = await taskService.getMyTasks({ search: "  project  ", isUrgent: true }, null);
  await taskService.getMyTasks({ search: "project", isUrgent: true }, page.nextCursor);
  await taskService.getMyTasks({ status: "in_review" }, null);
  const requests = fixture.requests.slice(before);
  assert.equal(requests.length, 3);
  assert.ok(requests.every(request => request.url === "/task/my-tasks"));
  assert.equal(requests[0].params.search, "project");
  assert.equal(requests[0].params.isUrgent, true);
  assert.equal(requests[1].params.batchCursor, "personal-next-page");
  assert.equal(requests[2].params.status, "in_review");
  assert.ok(requests.every(request => !("assigneeId" in request.params)));
});

test("personal counts use the authenticated caller endpoint and validate its response", async () => {
  fixture.response = {
    total: 2,
    urgent: 1,
    byStatus: {
      waiting_for_response: 0,
      not_started: 1,
      in_progress: 1,
      in_review: 0,
      proposal_sent: 0,
    },
  };
  assert.equal((await taskService.getMyCounts()).total, 2);
  assert.equal(fixture.requests.at(-1).url, "/task/my-tasks/counts");
  assert.equal(fixture.requests.at(-1).params == null, true);
  fixture.response = { total: 100 };
  await assert.rejects(taskService.getMyCounts(), /Unexpected response shape/);
  fixture.response = { items: [{ ...sample, status: "invalid" }], nextCursor: null };
  await assert.rejects(taskService.getMyTasks({}, null), /Unexpected response shape/);
});

test("personal task/count caches are isolated by account and from shared project queries", () => {
  assert.notDeepEqual(QUERY_KEYS.myTasks("user-a", {}), QUERY_KEYS.myTasks("user-b", {}));
  assert.notDeepEqual(QUERY_KEYS.myTaskCounts("user-a"), QUERY_KEYS.myTaskCounts("user-b"));
  assert.notDeepEqual(QUERY_KEYS.myTasks("user-a", {}), QUERY_KEYS.tasks({}));
  assert.notDeepEqual(QUERY_KEYS.myTaskCounts("user-a"), QUERY_KEYS.taskCounts({}));
  assert.notDeepEqual(
    QUERY_KEYS.myTasks("user-a", {}),
    QUERY_KEYS.myTasks("user-a", { isUrgent: true }),
  );
  assert.equal(QUERY_KEYS.myTasks("user-a", {})[0], QUERY_KEYS.tasks({})[0]);
  assert.equal(QUERY_KEYS.myTaskCounts("user-a")[0], QUERY_KEYS.taskCounts({})[0]);
});

test("a personal endpoint failure is surfaced without falling back to the global list", async () => {
  const before = fixture.requests.length;
  fixture.error = new Error("Personal tasks unavailable");
  try {
    await assert.rejects(taskService.getMyTasks({}, null), /Personal tasks unavailable/);
    assert.equal(fixture.requests.length, before + 1);
    assert.equal(fixture.requests.at(-1).url, "/task/my-tasks");
  } finally {
    fixture.error = null;
  }
});
