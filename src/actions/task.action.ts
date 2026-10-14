import { taskService } from "../services/task.service";
import { queryClient } from "../providers/query-client";
import { QUERY_ROOTS } from "../constants/query-key.constant";
import type { TaskStatusType } from "../constants/task.constant";
import type { ICreateTaskPayload, TUpdateTaskPayload } from "../interfaces/task.interface";

export const refreshTaskQueriesAction = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.TASKS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.TASK] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.TASK_COUNTS] }),
  ]);

export const createTaskAction = async (payload: ICreateTaskPayload) => {
  const task = await taskService.create(payload);
  await refreshTaskQueriesAction();
  return task;
};
export const updateTaskAction = async ({
  taskId,
  payload,
}: {
  taskId: string;
  payload: TUpdateTaskPayload;
}) => {
  const task = await taskService.update(taskId, payload);
  await refreshTaskQueriesAction();
  return task;
};
export const updateTaskStatusAction = async ({
  taskId,
  status,
}: {
  taskId: string;
  status: TaskStatusType;
}) => {
  const task = await taskService.updateStatus(taskId, status);
  await refreshTaskQueriesAction();
  return task;
};
export const updateTaskUrgencyAction = async ({
  taskId,
  isUrgent,
}: {
  taskId: string;
  isUrgent: boolean;
}) => {
  const task = await taskService.updateUrgency(taskId, isUrgent);
  await refreshTaskQueriesAction();
  return task;
};
export const claimTaskAction = async (taskId: string) => {
  const task = await taskService.claim(taskId);
  await refreshTaskQueriesAction();
  return task;
};
export const deleteTaskAction = async (taskId: string) => {
  await taskService.delete(taskId);
  await refreshTaskQueriesAction();
};
