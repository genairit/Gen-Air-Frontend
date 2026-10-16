export const ENVIRONMENT_KEYS = {
  API_BASE_URL: "VITE_API_BASE_URL",
} as const;

export const DEFAULT_API_BASE_URL = "/api";

export const API_PAGE_SIZE = 200;

export const API_ENDPOINTS = {
  TASKS: "/task",
  MY_TASKS: "/task/my-tasks",
  MY_TASK_COUNTS: "/task/my-tasks/counts",
  TASK_COUNTS: "/task/counts",
  taskById: (taskId: string) => `/task/${taskId}`,
  taskStatus: (taskId: string) => `/task/${taskId}/status`,
  taskUrgency: (taskId: string) => `/task/${taskId}/urgency`,
  taskClaim: (taskId: string) => `/task/${taskId}/claim`,
  taskTransitions: (taskId: string) => `/task/${taskId}/transitions`,
  LOGIN: "/auth/login",
  USERS: "/user",
  MY_USER: "/user/me",
  MY_PASSWORD: "/user/me/password",
  USER_ROLE_COUNTS: "/user/role-counts",
  userById: (userId: string) => `/user/${userId}`,
  CUSTOMERS: "/customer",
  CUSTOMER_SYNC_STATUS_COUNTS: "/customer/sync-status-counts",
  customerById: (customerId: string) => `/customer/${customerId}`,
  PROJECTS: "/project",
  PROJECT_STAGE_COUNTS: "/project/stage-counts",
  projectById: (projectId: string) => `/project/${projectId}`,
  projectStage: (projectId: string) => `/project/${projectId}/stage`,
  projectApartments: (projectId: string) => `/project/${projectId}/apartments`,
  apartmentStageCounts: (projectId: string) => `/project/${projectId}/apartments/stage-counts`,
  PROJECT_STAGES: "/project-stage",
  PROJECT_TYPES: "/project-type",
  projectTransitions: (projectId: string) => `/project-stage-transition/by-project/${projectId}`,
  projectDriveContents: (projectId: string) => `/project-drive/${projectId}/contents`,
  projectDriveFiles: (projectId: string) => `/project-drive/${projectId}/files`,
  DRIVE_UPLOAD_POLICY: "/project-drive/upload-policy",
  ADDRESS_SUGGESTIONS: "/address/suggestions",
  addressPlace: (placeId: string) => `/address/places/${encodeURIComponent(placeId)}`,
} as const;

export const DRIVE_UPLOAD_FIELD_NAME = "files";

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;
