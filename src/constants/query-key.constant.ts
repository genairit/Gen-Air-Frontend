import type {
  IUserQuery,
  IProjectQuery,
  ICustomerQuery,
  IApartmentQuery,
  IProjectPageQuery,
} from "../interfaces/api-request.interface";

import type { ITaskQuery } from "../interfaces/task.interface";

export const QUERY_ROOTS = {
  TASKS: "tasks",
  TASK: "task",
  TASK_COUNTS: "task-counts",
  TASK_TRANSITIONS: "task-transitions",
  USERS: "users",
  CUSTOMER: "customer",
  CUSTOMERS: "customers",
  PROJECT: "project",
  PROJECTS: "projects",
  APARTMENTS: "apartments",
  APARTMENT_STAGE_COUNTS: "apartment-stage-counts",
  PROJECT_DRIVE: "project-drive",
  STAGE_COUNTS: "project-stage-counts",
  TRANSITIONS: "project-transitions",
} as const;

export const QUERY_KEYS = {
  tasks: (query: ITaskQuery) => [QUERY_ROOTS.TASKS, query],
  taskCounts: (query: ITaskQuery) => [
    QUERY_ROOTS.TASK_COUNTS,
    query.projectId ?? null,
    query.customerId ?? null,
    query.assigneeId ?? null,
    query.unassigned ?? null,
  ],
  task: (taskId: string) => [QUERY_ROOTS.TASK, taskId],
  taskTransitions: (taskId: string) => [QUERY_ROOTS.TASK_TRANSITIONS, taskId],
  PROJECT_TYPES: ["project-types"],
  PROJECT_STAGES: ["project-stages"],
  TEMPLATE_TREE: ["drive-template-tree"],
  USER_ROLE_COUNTS: ["user-role-counts"],
  CUSTOMER_SYNC_STATUS_COUNTS: ["customer-sync-status-counts"],
  addressSuggestions: (input: string, sessionToken: string) => [
    "address-suggestions",
    input,
    sessionToken,
  ],
  users: (query: IUserQuery) => [QUERY_ROOTS.USERS, query],
  customers: (query: ICustomerQuery) => [QUERY_ROOTS.CUSTOMERS, query],
  customer: (customerId: string) => [QUERY_ROOTS.CUSTOMER, customerId],
  projects: (query: IProjectQuery) => [QUERY_ROOTS.PROJECTS, query],
  projectPages: (query: IProjectPageQuery) => [QUERY_ROOTS.PROJECTS, "pages", query],
  stageCounts: (query: IProjectQuery) => [QUERY_ROOTS.STAGE_COUNTS, query],
  project: (projectId: string) => [QUERY_ROOTS.PROJECT, projectId],
  apartments: (buildingId: string, query: IApartmentQuery) => [
    QUERY_ROOTS.APARTMENTS,
    buildingId,
    query,
  ],
  allApartments: (buildingId: string) => [QUERY_ROOTS.APARTMENTS, buildingId, "all"],
  apartmentStageCounts: (buildingId: string) => [QUERY_ROOTS.APARTMENT_STAGE_COUNTS, buildingId],
  transitions: (projectId: string) => [QUERY_ROOTS.TRANSITIONS, projectId],
  driveContents: (projectId: string, folderId: string | null) => [
    QUERY_ROOTS.PROJECT_DRIVE,
    projectId,
    folderId,
  ],
} as const;
