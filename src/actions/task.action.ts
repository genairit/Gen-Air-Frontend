import { taskService } from "../services/task.service";
import { queryClient } from "../providers/query-client";
import { QUERY_ROOTS } from "../constants/query-key.constant";
import type { TaskStatusType } from "../constants/task.constant";
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

export const createTaskAction = async ({ payload, isUrgent }: ITaskCreation) => {
  const task = await taskService.create(payload);

  await markUrgentWhenRequested(task.id, isUrgent);
  await refreshTaskQueriesAction();

  return task.id;
};

export const updateTaskAction = async ({
  taskId,
  payload,
}: {
  taskId: string;
  payload: TUpdateTaskPayload;
}) => {
  await taskService.update(taskId, payload);
  await refreshTaskQueriesAction();
};

export const updateTaskStatusAction = async ({
  taskId,
  status,
}: {
  taskId: string;
  status: TaskStatusType;
}) => {
  await taskService.updateStatus(taskId, status);
  await refreshTaskQueriesAction();
};

export const updateTaskUrgencyAction = async ({
  taskId,
  isUrgent,
}: {
  taskId: string;
  isUrgent: boolean;
}) => {
  await taskService.updateUrgency(taskId, isUrgent);
  await refreshTaskQueriesAction();
};

export const claimTaskAction = async (taskId: string) => {
  await taskService.claim(taskId);
  await refreshTaskQueriesAction();
};

export const deleteTaskAction = async (taskId: string) => {
  await taskService.delete(taskId);
  await refreshTaskQueriesAction();
};
