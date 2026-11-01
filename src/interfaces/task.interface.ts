import type { QueryKey } from "@tanstack/react-query";
import type { TaskType } from "../constants/task-type.constant";
import type { TaskStatusType } from "../constants/task.constant";
import type { TASK_TYPES } from "../constants/task-type.constant";
import type { IApiUser, IApiProjectReference, IApiCustomerReference } from "./api.interface";

export interface IProjectParentCustomerSource {
  customer?: IApiCustomerReference | null;
}

export interface IProjectCustomerSource extends IProjectParentCustomerSource {
  parentProject?: IProjectParentCustomerSource | null;
}

export interface IApiTaskProject extends IApiProjectReference {
  parentProject?: IApiProjectReference | null;
}

export interface IApiTask {
  id: string;
  title: string;
  isUrgent: boolean;
  createdAt: string;
  updatedAt: string;
  taskType: TaskType;
  createdById: string;
  dueDate: string | null;
  status: TaskStatusType;
  projectId: string | null;
  deletedAt: string | null;
  customerId: string | null;
  assigneeId: string | null;
  description: string | null;
  assignee?: IApiUser | null;
  createdBy?: IApiUser | null;
  urgencyMarkedAt: string | null;
  urgencyMarkedById: string | null;
  project?: IApiTaskProject | null;
  urgencyMarkedBy?: IApiUser | null;
  customer?: IApiCustomerReference | null;
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
  projectId: string;
  description: string;
  dueDate: string | null;
  assigneeId: string | null;
  taskType: typeof TASK_TYPES.GENERAL;
}

export type TUpdateTaskPayload = Partial<Omit<ICreateTaskPayload, "taskType">>;

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
  assigneeOptionId: string | null;
}

export interface ITaskLinkReader {
  getName: (task: IApiTask) => string;
  buildPath: (linkedId: string) => string;
  getId: (task: IApiTask) => string | null;
  getContextCustomer: (task: IApiTask) => IApiCustomerReference | null;
}

export interface ITaskLinkOption {
  id: string;
  name: string;
  caption: string;
  tag: string | null;
}

export type TaskFormFieldType =
  "title" | "dueDate" | "projectId" | "description" | "assigneeOptionId";

export type TTaskFormErrors = Partial<Record<TaskFormFieldType, string>>;

export type TTaskFormErrorEntry = [keyof TTaskFormErrors, string | null];

export type UrgencyChangeType = "set" | "clear";

export interface IUrgencyConfirmation {
  taskTitle: string;
  recipient: string;
  isBeforeSave: boolean;
  kind: UrgencyChangeType;
}

export interface IApiTaskTransition {
  id: string;
  taskId: string;
  createdAt: string;
  changedById: string;
  toStatus: TaskStatusType;
  changedBy?: IApiUser | null;
  fromStatus: TaskStatusType | null;
}

export interface ITaskStatusChange {
  taskId: string;
  updatedAt?: string;
  status: TaskStatusType;
}

export interface ITaskStatusSnapshot {
  task: IApiTask | null;
  lists: { queryKey: QueryKey; status: TaskStatusType }[];
}
