import type { TQuotationStatus } from "./quotation.interface";
import type { TASK_QUOTATION_UNAVAILABLE } from "../constants/task-quotation.constant";

export interface ITaskQuotationSummary {
  id: string;
  number: string;
  isPrimary: boolean;
  status: TQuotationStatus;
}
export interface ITaskQuotationContext {
  canCreate: boolean;
  projectId: string | null;
  customerId: string | null;
  primaryQuotationId: string | null;
  quotations: ITaskQuotationSummary[];
  unavailableReason:
    (typeof TASK_QUOTATION_UNAVAILABLE)[keyof typeof TASK_QUOTATION_UNAVAILABLE] | null;
}
export interface ITaskQuotationResult {
  created: boolean;
  quotationId: string;
}
export interface IQuotationTaskLink {
  title: string;
  taskId: string;
  isPrimary: boolean;
}
