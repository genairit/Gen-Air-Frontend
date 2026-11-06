import {
  PAYMENT_STAGES_LABEL,
  PAYMENT_TERMS_LABELS,
  type PaymentTermsType,
} from "../constants/payment-terms.constant";

import { isPaymentTerms } from "./guards/api.guard";
import type { IQuotation } from "../interfaces/quotation.interface";

export const quotationHasPaymentConflict = (quotation: IQuotation): boolean =>
  quotation.paymentSchedule.length > 0 && quotation.paymentTerms !== null;

export const quotationUsesPaymentStages = (quotation: IQuotation): boolean =>
  quotation.paymentSchedule.length > 0 && quotation.paymentTerms === null;

export const quotationPaymentLabel = (quotation: IQuotation): string => {
  if (quotationHasPaymentConflict(quotation)) {
    return "יש לבחור בין תנאי תשלום קבועים לשלבי תשלום";
  }
  if (quotationUsesPaymentStages(quotation)) {
    return PAYMENT_STAGES_LABEL;
  }
  return isPaymentTerms(quotation.paymentTerms)
    ? PAYMENT_TERMS_LABELS[quotation.paymentTerms].title
    : "לא נבחרו תנאים";
};

export const selectQuotationPaymentStages = (quotation: IQuotation): IQuotation => ({
  ...quotation,
  paymentTerms: null,
  paymentSchedule: quotation.paymentSchedule.length
    ? quotation.paymentSchedule
    : [{ percent: "0", text: "" }],
});

export const changeQuotationPaymentSchedule = (
  quotation: IQuotation,
  paymentSchedule: IQuotation["paymentSchedule"],
): IQuotation => ({ ...quotation, paymentTerms: null, paymentSchedule });

export const selectQuotationPaymentTerm = (
  quotation: IQuotation,
  paymentTerms: PaymentTermsType,
): IQuotation => ({ ...quotation, paymentTerms, paymentSchedule: [] });
