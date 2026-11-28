import { hasStringFields, isNullableString, isRecord } from "./primitive.guard";
import type { IQuotationDocumentContext } from "../../interfaces/quotation-document.interface";

const isTextList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === "string");

const hasParty = (value: unknown) =>
  isRecord(value) &&
  typeof value.name === "string" &&
  [value.city, value.email, value.phone, value.address].every(isNullableString);

export const isQuotationDocumentContext = (value: unknown): value is IQuotationDocumentContext => {
  if (!isRecord(value)) {
    return false;
  }

  const { company, recipient, recipientContext, project, metadata, terms, paymentTermLabels } =
    value;
  return (
    hasStringFields(value, ["title", "printDate", "issuerName"]) &&
    isRecord(company) &&
    hasParty(company) &&
    hasStringFields(company, ["businessNumber", "vatFileNumber"]) &&
    isRecord(recipient) &&
    hasParty(recipient) &&
    isNullableString(recipient.customerNumber) &&
    isRecord(project) &&
    [project.name, project.address].every(isNullableString) &&
    isRecord(recipientContext) &&
    typeof recipientContext.customerId === "string" &&
    [recipientContext.projectId, recipientContext.salesAgentId].every(isNullableString) &&
    isRecord(metadata) &&
    hasStringFields(metadata, ["customerTaxLabel", "vatFileNumber"]) &&
    [metadata.validUntil, metadata.customerTaxId, metadata.salesAgent].every(isNullableString) &&
    isRecord(terms) &&
    typeof terms.approval === "string" &&
    [terms.general, terms.delivery, terms.warranty, terms.additional, value.defaultPayment].every(
      isTextList,
    ) &&
    isRecord(paymentTermLabels) &&
    Object.values(paymentTermLabels).every(label => typeof label === "string")
  );
};
