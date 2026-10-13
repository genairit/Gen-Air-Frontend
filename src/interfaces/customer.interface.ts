import type { IApiCustomer } from "./api.interface";
import type { PrioritySyncStatusType } from "../constants/priority-sync.constant";

export interface ICustomerSyncFilter {
  id: string;
  label: string;
  status: PrioritySyncStatusType | null;
}

export type TCustomerSyncStepState = "done" | "active" | "failed";

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
