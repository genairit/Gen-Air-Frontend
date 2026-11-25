export const ENVIRONMENT_KEYS = {
  API_BASE_URL: "VITE_API_BASE_URL",
} as const;

export const DEFAULT_API_BASE_URL = "/api";

export const API_PAGE_SIZE = 200;

export const API_ENDPOINTS = {
  QUOTATIONS: "/quotation",
  EXECUTION_PLANS: "/execution-plan",
  EXECUTION_PLAN_TEMPLATE: "/execution-plan/template",
  EXECUTION_PLAN_PENDING: "/execution-plan/pending",
  executionPlanById: (id: string) => `/execution-plan/${id}`,
  executionPlansForQuotation: (id: string) => `/execution-plan/quotation/${id}`,
  executionPlanDraftForFile: (projectId: string, fileId: string) =>
    `/execution-plan/project/${projectId}/file/${encodeURIComponent(fileId)}/draft`,
  executionPlanChecklist: (id: string) => `/execution-plan/${id}/checklist`,
  executionPlanSubmit: (id: string) => `/execution-plan/${id}/submit`,
  executionPlanDecision: (id: string) => `/execution-plan/${id}/decision`,
  executionPlanCancel: (id: string) => `/execution-plan/${id}/cancel`,
  QUOTATION_STATUS_COUNTS: "/quotation/status-counts",
  QUOTATION_SALES_AGENTS: "/quotation/sales-agents",
  CATALOGUE: "/catalogue-item",
  quotationById: (id: string) => `/quotation/${id}`,
  quotationCloneRecommended: (id: string): string => `/quotation/${id}/clone-recommended`,
  quotationClone: (id: string) => `/quotation/${id}/clone`,
  quotationPdf: (id: string) => `/quotation/${id}/pdf`,
  quotationReview: (id: string) => `/quotation/${id}/review`,
  quotationReject: (id: string) => `/quotation/${id}/reject`,
  quotationResubmit: (id: string) => `/quotation/${id}/resubmit`,
  quotationWarnings: (id: string) => `/quotation/${id}/warnings`,
  quotationApartmentLinks: (id: string) => `/quotation/${id}/apartment-links`,
  quotationApartmentOptions: (id: string) => `/quotation/${id}/apartment-options`,
  projectQuotations: (projectId: string) => `/quotation/project/${projectId}`,
  quotationCancel: (id: string) => `/quotation/${id}/cancel`,
  quotationRestore: (id: string) => `/quotation/${id}/restore`,
  quotationSalesAgent: (id: string) => `/quotation/${id}/sales-agent`,
  catalogueById: (id: string) => `/catalogue-item/${id}`,
  customerProjects: (id: string) => `/customer/${id}/projects`,
  taskQuotations: (id: string) => `/task/${id}/quotations`,
  taskQuotation: (id: string) => `/task/${id}/quotation`,
  TASKS: "/task",
  MY_TASKS: "/task/my-tasks",
  MY_TASK_COUNTS: "/task/my-tasks/counts",
  TASK_COUNTS: "/task/counts",
  taskById: (taskId: string) => `/task/${taskId}`,
  projectProtectedTasks: (projectId: string) => `/task/project/${projectId}/protected`,
  taskStatus: (taskId: string) => `/task/${taskId}/status`,
  taskUrgency: (taskId: string) => `/task/${taskId}/urgency`,
  taskClaim: (taskId: string) => `/task/${taskId}/claim`,
  taskTransitions: (taskId: string) => `/task/${taskId}/transitions`,
  LOGIN: "/auth/login",
  ROLE_SWITCH: "/auth/role",
  USERS: "/user",
  MY_USER: "/user/me",
  MY_PASSWORD: "/user/me/password",
  USER_ROLE_COUNTS: "/user/role-counts",
  userById: (userId: string) => `/user/${userId}`,
  CUSTOMERS: "/customer",
  CUSTOMER_SYNC_STATUS_COUNTS: "/customer/sync-status-counts",
  customerById: (customerId: string) => `/customer/${customerId}`,
  customerLinkableProjects: (customerId: string) => `/customer/${customerId}/linkable-projects`,
  PROJECTS: "/project",
  PROJECT_NAME_AVAILABILITY: "/project/name-availability",
  PROJECT_STAGE_COUNTS: "/project/stage-counts",
  projectById: (projectId: string) => `/project/${projectId}`,
  projectStage: (projectId: string) => `/project/${projectId}/stage`,
  projectApartments: (projectId: string) => `/project/${projectId}/apartments`,
  apartmentStageCounts: (projectId: string) => `/project/${projectId}/apartments/stage-counts`,
  PROJECT_STAGES: "/project-stage",
  PROJECT_TYPES: "/project-type",
  projectTransitions: (projectId: string) => `/project-stage-transition/by-project/${projectId}`,
  projectDriveContents: (projectId: string) => `/project-drive/${projectId}/contents`,
  projectSharedDocument: (projectId: string) => `/project-drive/${projectId}/shared-document`,
  projectDriveProvision: (projectId: string) => `/project-drive/${projectId}/provision`,
  projectDriveFiles: (projectId: string) => `/project-drive/${projectId}/files`,
  projectDriveFile: (projectId: string, fileId: string) =>
    `/project-drive/${projectId}/files/${encodeURIComponent(fileId)}`,
  EXISTING_DRIVE_FOLDER_PREVIEW: "/project-drive/existing-folder/preview",
  projectDriveCompleteTemplate: (projectId: string) =>
    `/project-drive/${projectId}/complete-template`,
  DRIVE_UPLOAD_POLICY: "/project-drive/upload-policy",
  ADDRESS_SUGGESTIONS: "/address/suggestions",
  addressPlace: (placeId: string) => `/address/places/${encodeURIComponent(placeId)}`,
  JENNY_CHAT: "/jenny/chat",
} as const;

export const DRIVE_UPLOAD_FIELD_NAME = "files";

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type HttpStatusType = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

export const API_ERROR_CODES = {
  INVALID_CURRENT_PASSWORD: "INVALID_CURRENT_PASSWORD",
} as const;
