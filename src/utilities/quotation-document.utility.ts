import { parseDateInput } from "./date.utility";
import { isDecimal } from "./guards/quotation.guard";
import { QUOTATION_DECIMAL } from "../constants/quotation.constant";
import type { IQuotation, IQuotationLine } from "../interfaces/quotation.interface";
import type { IQuotationDocumentContext } from "../interfaces/quotation-document.interface";

const amount = (value: string | null) => new QUOTATION_DECIMAL(isDecimal(value) ? value : 0);

export const quotationLineAmount = (
  line: Pick<IQuotationLine, "quantity" | "quotedPrice">,
): string => amount(line.quantity).times(amount(line.quotedPrice)).toFixed(2);

export const quotationDraftTotals = (quotation: IQuotation): IQuotation["totals"] => {
  const subtotal = quotation.sections
    .flatMap(section => section.items)
    .reduce((sum, line) => sum.plus(quotationLineAmount(line)), amount("0"));
  const pretax =
    quotation.targetPretaxAmount == null
      ? subtotal
          .times(amount("100").minus(amount(quotation.discountPercent)))
          .div(100)
          .toDecimalPlaces(2)
      : amount(quotation.targetPretaxAmount);
  const vat = pretax.times(amount(quotation.vatRate)).div(100).toDecimalPlaces(2);
  return {
    subtotal: subtotal.toFixed(2),
    discount: subtotal.minus(pretax).toFixed(2),
    pretax: pretax.toFixed(2),
    vat: vat.toFixed(2),
    total: pretax.plus(vat).toFixed(2),
  };
};

export const quotationDocumentDate = (value: string): string => {
  const date = parseDateInput(value);
  return date ? date.toLocaleDateString("he-IL") : "";
};

export const quotationPaymentParagraphs = (
  quotation: IQuotation,
  context: IQuotationDocumentContext,
) => {
  const label = quotation.paymentTerms && context.paymentTermLabels[quotation.paymentTerms];
  const custom = [label, quotation.paymentTermsNote].filter((text): text is string =>
    Boolean(text),
  );
  return custom.length ? [...custom, ...context.defaultPayment.slice(1)] : context.defaultPayment;
};
