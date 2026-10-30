import type {
  IApiCustomer,
  IApiProjectStage,
  IApiAuthorizedUser,
} from "../src/interfaces/api.interface";

import type {
  ICustomerProjectItem,
  ICustomerProjectPage,
} from "../src/interfaces/customer-project.interface";

import { QueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { PERMISSIONS } from "../src/constants/permission.constant";
import { PRIORITY_SYNC_STATUSES } from "../src/constants/priority-sync.constant";
import { CUSTOMER_PROJECT_KINDS } from "../src/constants/customer-project.constant";
import { CUSTOMER_CONTACT_QUERY_ROOT } from "../src/constants/customer-contact.constant";
import { PROJECT_DETAIL_FIELD_SETS } from "../src/constants/project-detail-field-set.constant";

export const STAGE_ID = "6502a045-2a7d-4bc8-8ba1-36eaedc49a00";
export const OTHER_STAGE_ID = "6502a045-2a7d-4bc8-8ba1-36eaedc49a01";
export const CUSTOMER_ID = "42000000-0000-4000-8000-000000000001";
export const OTHER_CUSTOMER_ID = "42000000-0000-4000-8000-000000000002";
export const noop = () => {};

export const stages: IApiProjectStage[] = [
  { id: STAGE_ID, name: "טיוטה", position: 0, tag: null, color: null, description: null },
  { id: OTHER_STAGE_ID, name: "ממתין", position: 1, tag: null, color: null, description: null },
];

export const createRelatedProject = (
  changes: Partial<ICustomerProjectItem> = {},
): ICustomerProjectItem => ({
  id: "44000000-0000-4000-8000-000000000001",
  name: "פרויקט בדיקה",
  code: "GA-TEST-1",
  kind: CUSTOMER_PROJECT_KINDS.PROJECT,
  stageId: STAGE_ID,
  stage: stages[0],
  parentProjectId: null,
  building: null,
  customerFloor: null,
  updatedAt: "2026-10-30T08:00:00.000Z",
  apartmentCount: 0,
  members: [{ user: { id: "member-1", firstName: "ישראל", lastName: "ישראלי" } }],
  projectType: {
    id: "type-1",
    name: "פרויקט עצמאי",
    position: 0,
    icon: null,
    tag: null,
    subtitle: null,
    description: null,
    canHaveApartments: false,
    detailFieldSet: PROJECT_DETAIL_FIELD_SETS.COMPANY,
  },
  ...changes,
});

export const createRelatedPage = (
  changes: Partial<ICustomerProjectPage> = {},
): ICustomerProjectPage => ({
  items: [createRelatedProject()],
  nextCursor: null,
  total: 1,
  counts: { total: 1, byStage: { [STAGE_ID]: 1 } },
  ...changes,
});

export const createCustomer = (id = CUSTOMER_ID): IApiCustomer => ({
  id,
  name: "לקוח לבדיקה",
  phone: "03-1234567",
  email: "customer@example.invalid",
  taxId: "514287937",
  address: "רחוב לבדיקה",
  contactName: "איש קשר",
  createdAt: "2026-10-30T00:00:00.000Z",
  priorityId: null,
  prioritySyncAttempts: 0,
  prioritySyncedAt: null,
  prioritySyncError: null,
  customerType: PROJECT_DETAIL_FIELD_SETS.COMPANY,
  prioritySyncStatus: PRIORITY_SYNC_STATUSES.PENDING,
});

export const createUser = (
  permissions: IApiAuthorizedUser["permissions"] = [
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.PROJECTS_READ,
  ],
): IApiAuthorizedUser => ({
  id: "user-1",
  firstName: "בודק",
  lastName: "לבדיקה",
  phone: "",
  email: "test@example.invalid",
  role: USER_ROLES.SYSTEM_ADMIN,
  employeeNumber: "EMP-TEST",
  deletedAt: null,
  permissions,
});

export const createClient = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(QUERY_KEYS.PROJECT_STAGES, stages);
  client.setQueryData(QUERY_KEYS.customer(CUSTOMER_ID), createCustomer());
  client.setQueryData([CUSTOMER_CONTACT_QUERY_ROOT, CUSTOMER_ID], []);
  return client;
};

export interface ITestElement {
  type: unknown;
}

export const createNodeMock = (element: ITestElement) => {
  if (element.type !== "input") {
    return null;
  }

  return {
    nodeName: "INPUT",
    value: "",
    focus: noop,
    blur: noop,
    setAttribute: noop,
    removeAttribute: noop,
    setSelectionRange: noop,
  };
};
