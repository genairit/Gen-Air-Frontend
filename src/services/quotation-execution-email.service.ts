import type {
  ISendQuotationEmail,
  IQuotationEmailContext,
  IQuotationEmailReceipt,
} from "../interfaces/quotation-execution-email.interface";

import { httpClient, ensureResponse } from "./http-client.service";

const endpoint = (taskId: string) => `/quotation-execution-email/${encodeURIComponent(taskId)}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isReceipt = (value: unknown): value is IQuotationEmailReceipt =>
  isRecord(value) &&
  ["preparing", "sending", "sent", "failed", "uncertain"].includes(String(value.status)) &&
  typeof value.requestId === "string" &&
  (value.providerMessageId === null || typeof value.providerMessageId === "string") &&
  typeof value.updatedAt === "string";

const isContext = (value: unknown): value is IQuotationEmailContext =>
  isRecord(value) &&
  ["taskId", "projectId", "projectName"].every(key => typeof value[key] === "string") &&
  (value.apartmentNumber === null || typeof value.apartmentNumber === "string") &&
  Array.isArray(value.contacts) &&
  value.contacts.every(
    contact =>
      isRecord(contact) &&
      ["id", "name", "email"].every(key => typeof contact[key] === "string") &&
      (contact.role === null || typeof contact.role === "string"),
  ) &&
  (value.delivery === null || isReceipt(value.delivery));

export const quotationExecutionEmailService = {
  async getContext(taskId: string) {
    const url = `${endpoint(taskId)}/context`;
    const response = await httpClient.get<unknown>(url);
    return ensureResponse(url, response.data, isContext);
  },
  async send(taskId: string, input: ISendQuotationEmail) {
    const url = `${endpoint(taskId)}/send`;
    const response = await httpClient.post<unknown>(url, input);
    return ensureResponse(url, response.data, isReceipt);
  },
};
