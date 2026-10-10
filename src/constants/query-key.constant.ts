import type { IUserQuery, IProjectQuery } from "../interfaces/api-request.interface";

export const QUERY_ROOTS = {
  USERS: "users",
  PROJECT: "project",
  PROJECTS: "projects",
  PROJECT_DRIVE: "project-drive",
  STAGE_COUNTS: "project-stage-counts",
  TRANSITIONS: "project-transitions",
} as const;

export const QUERY_KEYS = {
  PROJECT_TYPES: ["project-types"],
  PROJECT_STAGES: ["project-stages"],
  TEMPLATE_TREE: ["drive-template-tree"],
  USER_ROLE_COUNTS: ["user-role-counts"],
  users: (query: IUserQuery) => [QUERY_ROOTS.USERS, query],
  projects: (query: IProjectQuery) => [QUERY_ROOTS.PROJECTS, query],
  stageCounts: (query: IProjectQuery) => [QUERY_ROOTS.STAGE_COUNTS, query],
  project: (projectId: string) => [QUERY_ROOTS.PROJECT, projectId],
  transitions: (projectId: string) => [QUERY_ROOTS.TRANSITIONS, projectId],
  driveContents: (projectId: string, folderId: string | null) => [
    QUERY_ROOTS.PROJECT_DRIVE,
    projectId,
    folderId,
  ],
} as const;
