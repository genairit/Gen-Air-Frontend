import type { IApiUser } from "./api.interface";
import type { TaskStatusType } from "../constants/task.constant";

export interface IApiTaskProject {
  id: string;
  code: string;
  name: string;
}

export interface IApiTaskCustomer {
  id: string;
  name: string;
}

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
  assignee?: IApiUser | null;
  createdBy?: IApiUser | null;
  urgencyMarkedAt: string | null;
  urgencyMarkedById: string | null;
  project?: IApiTaskProject | null;
  urgencyMarkedBy?: IApiUser | null;
  customer?: IApiTaskCustomer | null;
}

export interface ITaskQuery {
  search?: string;
  projectId?: string | null;
  isUrgent?: boolean | null;
  customerId?: string | null;
  assigneeId?: string | null;
  unassigned?: boolean | null;
  status?: TaskStatusType | null;
}

export type TTaskStatusCounts = Record<TaskStatusType, number>;

export interface ITaskCounts {
  total: number;
  urgent: number;
  byStatus: TTaskStatusCounts;
}

export interface ICreateTaskPayload {
  title: string;
  dueDate: string;
  projectId: string;
  customerId: string;
  description: string;
  assigneeId: string | null;
}

export type TUpdateTaskPayload = Partial<ICreateTaskPayload>;

export interface ITaskCreation {
  isUrgent: boolean;
  payload: ICreateTaskPayload;
}

export interface ITaskFormValues {
  title: string;
  dueDate: string;
  isUrgent: boolean;
  description: string;
  projectId: string | null;
  customerId: string | null;
  isCustomerFromProject: boolean;
  assigneeOptionId: string | null;
}

export type TaskFormFieldType =
  "title" | "dueDate" | "projectId" | "customerId" | "description" | "assigneeOptionId";

export type TTaskFormErrors = Partial<Record<TaskFormFieldType, string>>;

export type UrgencyChangeType = "set" | "clear";

export interface IUrgencyConfirmation {
  taskTitle: string;
  recipient: string;
  isBeforeSave: boolean;
  kind: UrgencyChangeType;
}
