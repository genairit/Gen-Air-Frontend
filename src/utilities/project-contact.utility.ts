import { isCustomerContact } from "./customer-contact.utility";
import { isRecord, isNullableString } from "./guards/primitive.guard";
import type { IProjectContactLink } from "../interfaces/project-contact.interface";

export const isProjectContactLink = (value: unknown): value is IProjectContactLink =>
  isRecord(value) &&
  typeof value.projectId === "string" &&
  typeof value.contactId === "string" &&
  typeof value.isPrimary === "boolean" &&
  isNullableString(value.role) &&
  isCustomerContact(value.contact);

export const isProjectContactLinkList = (value: unknown): value is IProjectContactLink[] =>
  Array.isArray(value) && value.every(isProjectContactLink);
