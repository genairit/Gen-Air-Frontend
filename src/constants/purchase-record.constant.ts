import { PROJECT_BOQ_BASIS, type ProjectBoqBasisType } from "./project-boq.constant";

export const PURCHASE_RECORD_STATUS = {
  DRAFT: "draft",
  REQUESTED: "requested",
  REVIEWED: "reviewed",
  APPROVED: "approved",
  ORDERED: "ordered",
  CANCELLED: "cancelled",
} as const;

export type TPurchaseRecordStatus =
  (typeof PURCHASE_RECORD_STATUS)[keyof typeof PURCHASE_RECORD_STATUS];

export const PURCHASE_ACTION = { REQUEST: "request", ORDER: "order" } as const;
export type TPurchaseAction = (typeof PURCHASE_ACTION)[keyof typeof PURCHASE_ACTION];
export const PURCHASE_ALL_CATEGORY = "all";

export const PURCHASE_RECORD_LABELS: Record<TPurchaseRecordStatus, string> = {
  [PURCHASE_RECORD_STATUS.DRAFT]: "טיוטה",
  [PURCHASE_RECORD_STATUS.REQUESTED]: "התבקשה",
  [PURCHASE_RECORD_STATUS.REVIEWED]: "נבדקה",
  [PURCHASE_RECORD_STATUS.APPROVED]: "אושרה",
  [PURCHASE_RECORD_STATUS.ORDERED]: "הוזמנה",
  [PURCHASE_RECORD_STATUS.CANCELLED]: "בוטלה",
};

export const PURCHASE_RECORD_NEXT_STATUS: Record<
  TPurchaseRecordStatus,
  TPurchaseRecordStatus | null
> = {
  [PURCHASE_RECORD_STATUS.DRAFT]: PURCHASE_RECORD_STATUS.REQUESTED,
  [PURCHASE_RECORD_STATUS.REQUESTED]: PURCHASE_RECORD_STATUS.REVIEWED,
  [PURCHASE_RECORD_STATUS.REVIEWED]: PURCHASE_RECORD_STATUS.APPROVED,
  [PURCHASE_RECORD_STATUS.APPROVED]: PURCHASE_RECORD_STATUS.ORDERED,
  [PURCHASE_RECORD_STATUS.ORDERED]: null,
  [PURCHASE_RECORD_STATUS.CANCELLED]: null,
};
export const PURCHASE_SOURCE_LABELS: Record<ProjectBoqBasisType, string> = {
  [PROJECT_BOQ_BASIS.FIXED]: "לפי קטלוג",
  [PROJECT_BOQ_BASIS.CONDITIONAL]: "תלוי פרויקט",
  [PROJECT_BOQ_BASIS.MEASUREMENT]: "מדידה בפרויקט",
  [PROJECT_BOQ_BASIS.MANUAL]: "נוסף ידנית",
};

export const PURCHASE_BASIS_NOTES: Record<ProjectBoqBasisType, string | null> = {
  [PROJECT_BOQ_BASIS.FIXED]: null,
  [PROJECT_BOQ_BASIS.CONDITIONAL]: "כמות מותנית בפרויקט",
  [PROJECT_BOQ_BASIS.MEASUREMENT]: "כמות לפי מדידת פרויקט",
  [PROJECT_BOQ_BASIS.MANUAL]: null,
};
