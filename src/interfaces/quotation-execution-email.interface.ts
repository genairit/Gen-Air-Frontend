export interface IQuotationEmailContact {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

export interface IQuotationEmailReceipt {
  requestId: string;
  updatedAt: string;
  retryable: boolean;
  providerMessageId: string | null;
  status: "preparing" | "sending" | "sent" | "failed" | "uncertain";
}

export interface IQuotationEmailContext {
  taskId: string;
  projectId: string;
  projectName: string;
  apartmentNumber: string | null;
  contacts: IQuotationEmailContact[];
  delivery: IQuotationEmailReceipt | null;
}

export interface ISendQuotationEmail {
  requestId: string;
  zipFileId: string;
  planFileId: string;
  planVersion: string;
  architectContactId: string;
  recipientContactIds: string[];
}

export interface IQuotationEmailPreview {
  body: string;
  subject: string;
  senderName: string;
}
