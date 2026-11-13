import { isRecord, isNullableString } from "./guards/primitive.guard";
import type { ILinkableProject } from "../interfaces/customer-project-link.interface";

export const isLinkableProject = (value: unknown): value is ILinkableProject => {
  if (!isRecord(value)) {
    return false;
  }

  const customer = value.customer;
  const validCustomer =
    customer === null ||
    (isRecord(customer) && typeof customer.id === "string" && typeof customer.name === "string");
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.code === "string" &&
    isNullableString(value.customerId) &&
    isNullableString(value.parentProjectId) &&
    validCustomer
  );
};

export const isLinkableProjectList = (value: unknown): value is ILinkableProject[] =>
  Array.isArray(value) && value.every(isLinkableProject);
