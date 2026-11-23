import type { ITaskQuotationSummary } from "../interfaces/task-quotation.interface";

export const orderTaskQuotations = (
  quotations: readonly ITaskQuotationSummary[],
): ITaskQuotationSummary[] =>
  [...quotations].sort((first, second) => Number(second.isPrimary) - Number(first.isPrimary));
