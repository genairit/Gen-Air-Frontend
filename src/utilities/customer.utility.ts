import {
  CUSTOMERS_COPY,
  CUSTOMER_PAGE_COPY,
  CUSTOMER_PICKER_COPY,
  CUSTOMER_SYNC_STEP_TITLES,
  TAX_ID_LABEL_BY_CUSTOMER_TYPE,
} from "../constants/customer.constant";

import {
  PRIORITY_SYNC_STATUSES,
  PRIORITY_SYNC_STATUS_VALUES,
  type PrioritySyncStatusType,
} from "../constants/priority-sync.constant";

import { formatDate } from "./date.utility";
import { getFullName } from "./mappers/user.mapper";
import { DATE_FORMAT } from "../constants/date.constants";
import type { IApiCustomer, TCustomerSyncStatusCounts } from "../interfaces/api.interface";
import type { ICustomerSyncFilter, ICustomerSyncStep } from "../interfaces/customer.interface";

export const getCustomerId = (customer: IApiCustomer) => customer.id;

export const formatCustomerTaxId = (customer: IApiCustomer) =>
  `${TAX_ID_LABEL_BY_CUSTOMER_TYPE[customer.customerType]} ${customer.taxId}`;

export const formatPriorityId = (customer: IApiCustomer) =>
  customer.priorityId ?? CUSTOMERS_COPY.NO_PRIORITY_ID;

export const formatCustomerCount = ({ visible, total }: { visible: number; total: number }) =>
  `מציג ${visible} מתוך ${total} לקוחות`;

export const countCustomersForFilter = (
  counts: TCustomerSyncStatusCounts | null,
  filter: ICustomerSyncFilter,
) => {
  if (!counts) {
    return 0;
  }

  if (filter.status) {
    return counts[filter.status];
  }

  return PRIORITY_SYNC_STATUS_VALUES.reduce((total, status) => total + counts[status], 0);
};

const formatDateTime = (date: string | null) =>
  formatDate(date ? new Date(date) : null, DATE_FORMAT.FULL_DATE);

export const formatCustomerCreatedCaption = (customer: IApiCustomer) => {
  const createdDate = formatDate(new Date(customer.createdAt), DATE_FORMAT.DATE_DOTS);

  if (!customer.createdBy) {
    return createdDate;
  }

  return `${CUSTOMER_PAGE_COPY.CREATED_BY} ${getFullName(customer.createdBy)} · ${createdDate}`;
};

export const formatLastSynced = (customer: IApiCustomer) =>
  formatDateTime(customer.prioritySyncedAt);

export const formatSyncAttempts = (customer: IApiCustomer) =>
  `${customer.prioritySyncAttempts} ניסיונות סנכרון`;

const PRIORITY_STEP_BY_STATUS: Record<
  PrioritySyncStatusType,
  (customer: IApiCustomer) => ICustomerSyncStep
> = {
  synced: customer => ({
    state: "done",
    title: CUSTOMER_SYNC_STEP_TITLES.PRIORITY,
    caption: `מזהה ${customer.priorityId ?? ""}`,
  }),
  pending: () => ({
    state: "waiting",
    caption: "טרם בוצע סנכרון",
    title: CUSTOMER_SYNC_STEP_TITLES.PRIORITY,
  }),
  failed: customer => ({
    state: "failed",
    title: CUSTOMER_SYNC_STEP_TITLES.PRIORITY,
    caption: `נכשל · ${formatSyncAttempts(customer)}`,
  }),
};

export const getCustomerSyncSteps = (customer: IApiCustomer): ICustomerSyncStep[] => [
  PRIORITY_STEP_BY_STATUS[customer.prioritySyncStatus](customer),
  {
    state: "done",
    title: CUSTOMER_SYNC_STEP_TITLES.CRM,
    caption: `נשמר ${formatDate(new Date(customer.createdAt), DATE_FORMAT.DATE_DOTS)}`,
  },
];

export const isCustomerSelectable = (customer: IApiCustomer) =>
  customer.prioritySyncStatus !== PRIORITY_SYNC_STATUSES.FAILED;

export const getCustomerPickerLabel = (search: string) => {
  if (search.trim()) {
    return CUSTOMER_PICKER_COPY.RESULTS;
  }

  return CUSTOMER_PICKER_COPY.RECENT;
};

export const formatCustomerContactLine = (customer: IApiCustomer) =>
  [customer.contactName, customer.phone, customer.email].join(" · ");
