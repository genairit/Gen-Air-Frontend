import type {
  ITaskQuery,
  ICreateTaskPayload,
  TUpdateTaskPayload,
} from "../interfaces/task.interface";

import { isCursorPageOf } from "../utilities/guards/api.guard";
import type { TaskStatusType } from "../constants/task.constant";
import { httpClient, ensureResponse } from "./http-client.service";
import { API_ENDPOINTS, API_PAGE_SIZE } from "../constants/api.constant";
import { isApiTask, isTaskCounts } from "../utilities/guards/task.guard";

const toSearchParam = (search?: string) => search?.trim() || null;

class TaskService {
  async getByFilter(query: ITaskQuery, batchCursor: string | null) {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.TASKS, {
      params: {
        ...query,
        batchCursor,
        batchSize: API_PAGE_SIZE,
        search: toSearchParam(query.search),
      },
    });

    return ensureResponse(API_ENDPOINTS.TASKS, response.data, isCursorPageOf(isApiTask));
  }

  async getCounts({ projectId, customerId, assigneeId, unassigned }: ITaskQuery) {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.TASK_COUNTS, {
      params: { projectId, customerId, assigneeId, unassigned },
    });

    return ensureResponse(API_ENDPOINTS.TASK_COUNTS, response.data, isTaskCounts);
  }

  async getById(taskId: string) {
    const endpoint = API_ENDPOINTS.taskById(taskId);
    const response = await httpClient.get<unknown>(endpoint);

    return ensureResponse(endpoint, response.data, isApiTask);
  }

  async create(payload: ICreateTaskPayload) {
    const response = await httpClient.post<unknown>(API_ENDPOINTS.TASKS, payload);

    return ensureResponse(API_ENDPOINTS.TASKS, response.data, isApiTask);
  }

  async update(taskId: string, payload: TUpdateTaskPayload) {
    const endpoint = API_ENDPOINTS.taskById(taskId);
    const response = await httpClient.patch<unknown>(endpoint, payload);

    return ensureResponse(endpoint, response.data, isApiTask);
  }

  async updateStatus(taskId: string, status: TaskStatusType) {
    const endpoint = API_ENDPOINTS.taskStatus(taskId);
    const response = await httpClient.patch<unknown>(endpoint, { status });

    return ensureResponse(endpoint, response.data, isApiTask);
  }

  async updateUrgency(taskId: string, isUrgent: boolean) {
    const endpoint = API_ENDPOINTS.taskUrgency(taskId);
    const response = await httpClient.patch<unknown>(endpoint, { isUrgent });

    return ensureResponse(endpoint, response.data, isApiTask);
  }

  async claim(taskId: string) {
    const endpoint = API_ENDPOINTS.taskClaim(taskId);
    const response = await httpClient.patch<unknown>(endpoint);

    return ensureResponse(endpoint, response.data, isApiTask);
  }

  async delete(taskId: string) {
    await httpClient.delete(API_ENDPOINTS.taskById(taskId));
  }
}

export const taskService = new TaskService();
