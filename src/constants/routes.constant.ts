export const ROUTE_PARAMS = {
  PROJECT_ID: "projectId",
  CUSTOMER_ID: "customerId",
  APARTMENT_ID: "apartmentId",
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
  NEW_APARTMENT: `/projects/:${ROUTE_PARAMS.PROJECT_ID}/apartments/new`,
  APARTMENT: `/projects/:${ROUTE_PARAMS.PROJECT_ID}/apartments/:${ROUTE_PARAMS.APARTMENT_ID}`,
} as const;
