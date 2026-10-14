import type { TaskStatusType } from "../constants/task.constant";

export interface IApiTask {
  id: string;
  title: string;
  projectId: string;
  isUrgent: boolean;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  createdById: string;
  dueDate: string | null;
  status: TaskStatusType;
  deletedAt: string | null;
  assigneeId: string | null;
  description: string | null;
  urgencyMarkedAt: string | null;
  urgencyMarkedById: string | null;
}
export interface ITaskQuery {
  projectId?: string | null;
  isUrgent?: boolean | null;
  customerId?: string | null;
  assigneeId?: string | null;
  unassigned?: boolean | null;
  status?: TaskStatusType | null;
}
export interface ITaskCounts {
  total: number;
  urgent: number;
  byStatus: TTaskStatusCounts;
}
export type TTaskStatusCounts = Record<TaskStatusType, number>;
export interface ICreateTaskPayload {
  title: string;
  dueDate: string;
  projectId: string;
  customerId: string;
  description: string;
  assigneeId: string | null;
}
export type TUpdateTaskPayload = Partial<
  Omit<ICreateTaskPayload, "description" | "dueDate"> & Pick<IApiTask, "description" | "dueDate">
>;
