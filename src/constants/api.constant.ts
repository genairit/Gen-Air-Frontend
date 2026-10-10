export const ENVIRONMENT_KEYS = {
  API_BASE_URL: "VITE_API_BASE_URL",
} as const;

export const DEFAULT_API_BASE_URL = "/api";

export const API_PAGE_SIZE = 200;

export const API_ENDPOINTS = {
  LOGIN: "/auth/login",
  USERS: "/user",
  MY_USER: "/user/me",
  MY_PASSWORD: "/user/me/password",
  USER_ROLE_COUNTS: "/user/role-counts",
  userById: (userId: string) => `/user/${userId}`,
  PROJECTS: "/project",
  PROJECT_STAGE_COUNTS: "/project/stage-counts",
  projectById: (projectId: string) => `/project/${projectId}`,
  projectStage: (projectId: string) => `/project/${projectId}/stage`,
  PROJECT_STAGES: "/project-stage",
  PROJECT_STAGE_ORDER: "/project-stage/order",
  projectStageById: (stageId: string) => `/project-stage/${stageId}`,
  PROJECT_TYPES: "/project-type",
  projectTransitions: (projectId: string) => `/project-stage-transition/by-project/${projectId}`,
  projectDriveContents: (projectId: string) => `/project-drive/${projectId}/contents`,
  projectDriveFiles: (projectId: string) => `/project-drive/${projectId}/files`,
  DRIVE_TEMPLATE_FOLDERS: "/drive-template-folder",
} as const;

export const DRIVE_UPLOAD_FIELD_NAME = "files";

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
} as const;
