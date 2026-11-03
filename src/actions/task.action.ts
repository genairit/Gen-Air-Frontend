import {
  applyTaskStatusAction,
  restoreTaskStatusAction,
  snapshotTaskStatusAction,
} from "./task-status-cache.action";

import { taskService } from "../services/task.service";
import { queryClient } from "../providers/query-client";
import type { TaskStatusType } from "../constants/task.constant";
import { QUERY_KEYS, QUERY_ROOTS } from "../constants/query-key.constant";
import { AuthorizationContext } from "../managers/authorization-context.manager";
import type { ITaskCreation, TUpdateTaskPayload } from "../interfaces/task.interface";

export const refreshTaskQueriesAction = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.TASKS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.TASK] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.TASK_COUNTS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.TASK_TRANSITIONS] }),
  ]);

const markUrgentWhenRequested = async (taskId: string, isUrgent: boolean) => {
  if (!isUrgent) {
    return;
  }

  await taskService.updateUrgency(taskId, true);
};

export const createTaskAction = async ({ payload, isUrgent }: ITaskCreation): Promise<string> => {
  const context = new AuthorizationContext();
  const task = await taskService.create(payload);
  context.assertCurrent();

  await markUrgentWhenRequested(task.id, isUrgent);
  context.assertCurrent();
  await refreshTaskQueriesAction();
  context.assertCurrent();

  return task.id;
};

export const updateTaskAction = async ({
  taskId,
  payload,
}: {
  taskId: string;
  payload: TUpdateTaskPayload;
}): Promise<void> => {
  const context = new AuthorizationContext();
  await taskService.update(taskId, payload);
  context.assertCurrent();
  await refreshTaskQueriesAction();
  context.assertCurrent();
};

export const updateTaskStatusAction = async ({
  taskId,
  status,
}: {
  taskId: string;
  status: TaskStatusType;
}): Promise<void> => {
  const context = new AuthorizationContext();
  await Promise.all([
    queryClient.cancelQueries({ queryKey: [QUERY_ROOTS.TASKS] }),
    queryClient.cancelQueries({ queryKey: QUERY_KEYS.task(taskId) }),
  ]);
  context.assertCurrent();
  const snapshot = snapshotTaskStatusAction(taskId);
  applyTaskStatusAction({ taskId, status });

  try {
    const task = await taskService.updateStatus(taskId, status);
    context.assertCurrent();
    applyTaskStatusAction({ taskId, status: task.status, updatedAt: task.updatedAt });
  } catch (error) {
    context.assertCurrent();
    restoreTaskStatusAction(taskId, snapshot);
    throw error;
  } finally {
    if (context.isCurrent()) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.TASKS], refetchType: "none" }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(taskId) }),
        queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.TASK_COUNTS] }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.taskTransitions(taskId) }),
      ]);
    }
  }

  context.assertCurrent();
};

export const updateTaskUrgencyAction = async ({
  taskId,
  isUrgent,
}: {
  taskId: string;
  isUrgent: boolean;
}): Promise<void> => {
  const context = new AuthorizationContext();
  await taskService.updateUrgency(taskId, isUrgent);
  context.assertCurrent();
  await refreshTaskQueriesAction();
  context.assertCurrent();
};

export const claimTaskAction = async (taskId: string): Promise<void> => {
  const context = new AuthorizationContext();
  await taskService.claim(taskId);
  context.assertCurrent();
  await refreshTaskQueriesAction();
  context.assertCurrent();
};

export const deleteTaskAction = async (taskId: string): Promise<void> => {
  const context = new AuthorizationContext();
  await taskService.delete(taskId);
  context.assertCurrent();
  await refreshTaskQueriesAction();
  context.assertCurrent();
};
