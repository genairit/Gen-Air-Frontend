import { QUOTATION_STATUS } from "../constants/quotation.constant";
import type { IQuotation } from "../interfaces/quotation.interface";

export const quotationNeedsCorrection = (quotation: IQuotation): boolean =>
  quotation.status === QUOTATION_STATUS.DRAFT &&
  quotation.rejectionHistory.at(-1)?.resubmittedAt === null;
