import {
  applyTaskStatusAction,
  restoreTaskStatusAction,
  snapshotTaskStatusAction,
} from "../src/actions/task-status-cache.action";

import { test } from "node:test";
import assert from "node:assert/strict";
import { createTask } from "./project-tasks.fixture";
import { queryClient } from "../src/providers/query-client";
import { TASK_STATUSES } from "../src/constants/task.constant";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { TASK_TYPES } from "../src/constants/task-type.constant";

test("task status update leaves protected slot cache intact and restores paged tasks", () => {
  queryClient.clear();
  const task = createTask({ taskType: TASK_TYPES.QUOTATION });
  const taskKey = QUERY_KEYS.task(task.id);
  const listKey = QUERY_KEYS.tasks({ projectId: "project-1" });
  const slotKey = QUERY_KEYS.projectProtectedTasks("project-1");
  const slots = [{ id: task.id, taskType: TASK_TYPES.QUOTATION, available: true }];
  const pages = { pages: [{ items: [task], nextCursor: null }], pageParams: [null] };

  queryClient.setQueryData(taskKey, task);
  queryClient.setQueryData(listKey, pages);
  queryClient.setQueryData(slotKey, slots);

  const snapshot = snapshotTaskStatusAction(task.id);
  applyTaskStatusAction({ taskId: task.id, status: TASK_STATUSES.IN_PROGRESS });

  assert.equal(queryClient.getQueryData<typeof task>(taskKey)?.status, TASK_STATUSES.IN_PROGRESS);
  assert.equal(
    queryClient.getQueryData<typeof pages>(listKey)?.pages[0].items[0].status,
    TASK_STATUSES.IN_PROGRESS,
  );
  assert.deepEqual(queryClient.getQueryData(slotKey), slots);

  restoreTaskStatusAction(task.id, snapshot);
  assert.equal(queryClient.getQueryData<typeof task>(taskKey)?.status, TASK_STATUSES.NOT_STARTED);
  assert.equal(
    queryClient.getQueryData<typeof pages>(listKey)?.pages[0].items[0].status,
    TASK_STATUSES.NOT_STARTED,
  );
  assert.deepEqual(queryClient.getQueryData(slotKey), slots);
  queryClient.clear();
});
