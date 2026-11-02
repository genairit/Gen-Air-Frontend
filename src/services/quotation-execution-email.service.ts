import type {
  ISendQuotationEmail,
  IQuotationEmailContext,
  IQuotationEmailReceipt,
  IQuotationEmailPreview,
} from "../interfaces/quotation-execution-email.interface";

import { httpClient, ensureResponse } from "./http-client.service";
import { isQuotationEmailStatus } from "../constants/quotation-execution-email.constant";

const endpoint = (taskId: string) => `/quotation-execution-email/${encodeURIComponent(taskId)}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isReceipt = (value: unknown): value is IQuotationEmailReceipt =>
  isRecord(value) &&
  isQuotationEmailStatus(value.status) &&
  typeof value.requestId === "string" &&
  (value.providerMessageId === null || typeof value.providerMessageId === "string") &&
  typeof value.updatedAt === "string" &&
  typeof value.retryable === "boolean";

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

const isPreview = (value: unknown): value is IQuotationEmailPreview =>
  isRecord(value) && ["subject", "body", "senderName"].every(key => typeof value[key] === "string");

export const quotationExecutionEmailService = {
  async getContext(taskId: string) {
    const url = `${endpoint(taskId)}/context`;
    const response = await httpClient.get<unknown>(url);
    return ensureResponse(url, response.data, isContext);
  },
  async getPreview(taskId: string, architectContactId: string, planVersion: string) {
    const url = `${endpoint(taskId)}/preview`;
    const response = await httpClient.post<unknown>(url, { architectContactId, planVersion });
    return ensureResponse(url, response.data, isPreview);
  },
  async send(taskId: string, input: ISendQuotationEmail) {
    const url = `${endpoint(taskId)}/send`;
    const response = await httpClient.post<unknown>(url, input);
    return ensureResponse(url, response.data, isReceipt);
  },
};
