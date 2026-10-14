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
    customerId: "customer-1",
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
    customerId: "customer-1",
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

test("task management is manager-only while employee status permission matches the reconciled API", () => {
  assert.equal(hasPermission({ role: "project_manager" }, "MANAGE_TASKS"), true);
  assert.equal(hasPermission({ role: "system_admin" }, "MANAGE_TASKS"), true);
  assert.equal(hasPermission({ role: "lead_installer" }, "MANAGE_TASKS"), false);
  assert.equal(hasPermission({ role: "secretary" }, "MANAGE_TASKS"), false);
  assert.equal(hasPermission({ role: "lead_installer" }, "UPDATE_TASK_STATUS"), true);
  assert.equal(hasPermission(null, "MANAGE_TASKS"), false);
});
