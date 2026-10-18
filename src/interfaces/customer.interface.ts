import type { IApiCustomer } from "./api.interface";
import type { IValidationResult } from "./validation-result.interface";
import type { PrioritySyncStatusType } from "../constants/priority-sync.constant";
import type { TFieldType } from "../components/TextField/constants/textfield.constants";
import type { ProjectDetailFieldSetType } from "../constants/project-detail-field-set.constant";

export interface ICustomerSyncFilter {
  id: string;
  label: string;
  status: PrioritySyncStatusType | null;
}

export type TCustomerSyncStepState = "done" | "active" | "failed" | "waiting";

export interface ICustomerSyncStep {
  title: string;
  caption: string;
  state: TCustomerSyncStepState;
}

export interface ICustomerDetailField {
  label: string;
  isLtr: boolean;
  field: keyof Pick<IApiCustomer, "name" | "taxId" | "address" | "contactName" | "phone" | "email">;
}

export interface ICreateCustomerPayload {
  name: string;
  taxId: string;
  phone: string;
  email: string;
  address: string;
  contactName: string;
  customerType: ProjectDetailFieldSetType;
}

export type CustomerFormFieldType = Exclude<keyof ICreateCustomerPayload, "customerType">;

export interface ICustomerFormField {
  label: string;
  isLtr: boolean;
  maxLength: number;
  inputType: TFieldType;
  field: CustomerFormFieldType;
  validator: (value: string) => IValidationResult;
}
