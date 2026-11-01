import {
  EMPTY_TASK_FORM,
  POOL_ASSIGNEE_ID,
  TASK_ASSIGNEES_QUERY,
} from "../src/constants/task.constant";

import { QueryClient } from "@tanstack/react-query";
import { TASK_STATUSES } from "../src/constants/task.constant";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { TASK_TYPES } from "../src/constants/task-type.constant";
import type { IApiTask } from "../src/interfaces/task.interface";
import type { ITaskFormValues } from "../src/interfaces/task.interface";
import type { IApiProject, IApiUser } from "../src/interfaces/api.interface";

export const createTask = (changes: Partial<IApiTask> = {}): IApiTask => ({
  id: "task-1",
  title: "משימה כללית",
  taskType: TASK_TYPES.GENERAL,
  isUrgent: false,
  createdAt: "2026-10-30T00:00:00.000Z",
  updatedAt: "2026-10-30T00:00:00.000Z",
  createdById: "creator-1",
  dueDate: null,
  status: TASK_STATUSES.NOT_STARTED,
  projectId: "project-1",
  deletedAt: null,
  customerId: null,
  assigneeId: null,
  description: "תיאור המשימה",
  urgencyMarkedAt: null,
  urgencyMarkedById: null,
  project: { id: "project-1", name: "הפרויקט הנבחר", code: "GA-1" },
  ...changes,
});

export const project: IApiProject = {
  id: "project-1",
  code: "GA-1",
  name: "הפרויקט הנבחר",
  stageId: "draft-stage",
  projectTypeId: "type-1",
  customerId: "customer-1",
  updatedAt: "2026-10-30T00:00:00.000Z",
  notes: null,
  priorityId: null,
  driveFolderId: null,
  parentProjectId: null,
  prioritySyncedAt: null,
  address: null,
  addressCity: null,
  addressPlaceId: null,
  paymentTerms: null,
  paymentTermsNote: null,
  contactName: null,
  contactPhone: null,
  contactRole: null,
  customerName: null,
  customerCity: null,
  customerUnit: null,
  customerFloor: null,
  customerPhone: null,
  customerEmail: null,
  customerAddress: null,
  customerApartment: null,
  customerCompanyNumber: null,
  customerAssociationNumber: null,
};

export const noop = () => {};
export const engineer: IApiUser = {
  id: "engineer-1",
  firstName: "מהנדס",
  lastName: "לבדיקה",
  email: "engineer@example.invalid",
  phone: "",
  role: USER_ROLES.ENGINEER,
  employeeNumber: "EMP-1",
  deletedAt: null,
};
export const formValues: ITaskFormValues = {
  ...EMPTY_TASK_FORM,
  projectId: project.id,
  assigneeOptionId: POOL_ASSIGNEE_ID,
};
export const createClient = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
  client.setQueryData(QUERY_KEYS.users(TASK_ASSIGNEES_QUERY), [engineer]);
  client.setQueryData(QUERY_KEYS.project(project.id), project);
  client.setQueryData(
    QUERY_KEYS.projects({ search: "", managerId: null, projectTypeId: null }),
    [],
  );
  return client;
};
