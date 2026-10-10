export const ROUTE_PARAMS = {
  PROJECT_ID: "projectId",
} as const;

export const ROUTE_PATHS = {
  BOARD: "/",
  LOGIN: "/login",
  SETTINGS: "/settings",
  EMPLOYEES: "/employees",
  COMPONENTS: "/components",
  NEW_PROJECT: "/projects/new",
  PROJECT: `/projects/:${ROUTE_PARAMS.PROJECT_ID}`,
  EDIT_PROJECT: `/projects/:${ROUTE_PARAMS.PROJECT_ID}/edit`,
} as const;
