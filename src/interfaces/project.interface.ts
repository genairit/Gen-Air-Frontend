import type { IconNameType } from "../constants/icon.constant";
import type { UserRoleType } from "../constants/user-role.constant";
import type { PaymentTermsType } from "../constants/payment-terms.constant";
import type { IApiProjectIntake, CustomerDetailFieldType } from "./api.interface";
import type { ProjectDetailFieldSetType } from "../constants/project-detail-field-set.constant";

export interface IProjectSummary {
  id: string;
  code: string;
  name: string;
  type: string;
  updatedLabel: string;
  teamInitials: string[];
  progress: number | null;
}

export type TRoleAssignees = Record<UserRoleType, string | null>;

export type TCustomerDetailValues = Record<CustomerDetailFieldType, string>;

export interface ITypeSwitchSummary {
  kept: CustomerDetailFieldType[];
  hidden: CustomerDetailFieldType[];
  needed: CustomerDetailFieldType[];
}

export interface ITypeSwitch {
  fromTypeId: string;
  summary: ITypeSwitchSummary;
}

export interface IVerifiedAddress {
  placeId: string;
  city: string | null;
  formattedAddress: string;
}

export type ContactFieldType = keyof Pick<
  IApiProjectIntake,
  "contactName" | "contactPhone" | "contactRole"
>;

export type TContactValues = Record<ContactFieldType, string>;

export interface IPaymentTermsValues {
  note: string;
  terms: PaymentTermsType | null;
}

export interface IProjectIntakeValues {
  contact: TContactValues;
  address: IVerifiedAddress | null;
  paymentTerms: IPaymentTermsValues;
}

export interface IProjectFormValues extends IProjectIntakeValues {
  name: string;
  typeId: string | null;
  stageId: string | null;
  assignees: TRoleAssignees;
  customerDetails: TCustomerDetailValues;
}

export interface IProjectSubmission {
  values: IProjectFormValues;
  fieldSet: ProjectDetailFieldSetType | null;
  originalIntake: IProjectIntakeValues | null;
}

export interface IBoardColumn {
  title: string;
  stageId: string;
  dotColor: string;
}

export interface IProjectFile {
  id: string;
  url: string;
  name: string;
  meta: string;
  icon?: IconNameType;
}

export interface ITimelineEntry {
  id: string;
  date: string;
  label: string;
  author: string;
  dotColor: string;
  isHighlighted?: boolean;
}

export interface IFolderTreeNode {
  id: string;
  name: string;
  depth: number;
  isLeaf?: boolean;
  icon?: IconNameType;
}

export interface IProjectFolder {
  id: string;
  name: string;
  fileCount: number;
  icon?: IconNameType;
}

export interface IProjectTypeOption {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  icon?: IconNameType;
}

export interface IStatusStage {
  id: string;
  tag: string;
  name: string;
  isDraft?: boolean;
  description: string;
}

export interface IChecklistTask {
  id: string;
  label: string;
}
