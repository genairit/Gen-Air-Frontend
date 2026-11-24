import { isPaymentTerms } from "./guards/api.guard";
import type { IQuotation } from "../interfaces/quotation.interface";
import type { IPaymentConfiguration } from "../interfaces/payment-configuration.interface";
import { PAYMENT_STAGES_LABEL, PAYMENT_TERMS_LABELS } from "../constants/payment-terms.constant";

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

export const quotationPaymentConfiguration = (quotation: IQuotation): IPaymentConfiguration => ({
  paymentTerms: isPaymentTerms(quotation.paymentTerms) ? quotation.paymentTerms : null,
  paymentSchedule: quotation.paymentSchedule,
});
