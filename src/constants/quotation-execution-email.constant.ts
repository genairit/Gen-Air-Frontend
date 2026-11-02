export const QUOTATION_EMAIL_STATUS = {
  PREPARING: "preparing",
  SENDING: "sending",
  SENT: "sent",
  FAILED: "failed",
  UNCERTAIN: "uncertain",
} as const;

export type QuotationEmailStatusType =
  (typeof QUOTATION_EMAIL_STATUS)[keyof typeof QUOTATION_EMAIL_STATUS];

export const isQuotationEmailStatus = (value: unknown): value is QuotationEmailStatusType =>
  Object.values(QUOTATION_EMAIL_STATUS).some(status => status === value);
