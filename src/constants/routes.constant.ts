export const ROUTE_PARAMS = {
  PROJECT_ID: "projectId",
  CUSTOMER_ID: "customerId",
  APARTMENT_ID: "apartmentId",
  TASK_ID: "taskId",
} as const;

export const ROUTE_PATHS = {
  BOARD: "/",
  LOGIN: "/login",
  SETTINGS: "/settings",
  EMPLOYEES: "/employees",
  CUSTOMERS: "/customers",
  CUSTOMER: `/customers/:${ROUTE_PARAMS.CUSTOMER_ID}`,
  COMPONENTS: "/components",
  NEW_PROJECT: "/projects/new",
  PROJECT: `/projects/:${ROUTE_PARAMS.PROJECT_ID}`,
  EDIT_PROJECT: `/projects/:${ROUTE_PARAMS.PROJECT_ID}/edit`,
  TASKS: "/tasks",
  NEW_TASK: "/tasks/new",
  TASK: `/tasks/:${ROUTE_PARAMS.TASK_ID}`,
  NEW_APARTMENT: `/projects/:${ROUTE_PARAMS.PROJECT_ID}/apartments/new`,
  APARTMENT: `/projects/:${ROUTE_PARAMS.PROJECT_ID}/apartments/:${ROUTE_PARAMS.APARTMENT_ID}`,
} as const;
