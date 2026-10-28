import type { UserRoleType } from "../constants/user-role.constant";
import type { ICustomerContact } from "./customer-contact.interface";
import type { PaymentTermsType } from "../constants/payment-terms.constant";
import type { FolderContentStatusType } from "../constants/drive-folder.constant";
import type { PrioritySyncStatusType } from "../constants/priority-sync.constant";
import type { ApartmentOwnershipType } from "../constants/apartment-commercial.constant";
import type { ProjectDetailFieldSetType } from "../constants/project-detail-field-set.constant";

export interface ICursorPage<TItem> {
  items: TItem[];
  nextCursor: string | null;
}

export interface IApiUser {
  id: string;
  email: string;
  phone: string;
  lastName: string;
  firstName: string;
  role: UserRoleType;
  employeeNumber: string;
  deletedAt: string | null;
}

export interface ILoginResponse {
  user: IApiUser;
  accessToken: string;
}

export interface IApiProjectStage {
  id: string;
  name: string;
  position: number;
  tag: string | null;
  color: string | null;
  description: string | null;
}

export interface IApiProjectType {
  id: string;
  name: string;
  position: number;
  tag: string | null;
  icon: string | null;
  subtitle: string | null;
  description: string | null;
  canHaveApartments: boolean;
  detailFieldSet: ProjectDetailFieldSetType;
}

export interface IApiProjectMember {
  id: string;
  userId: string;
  user?: IApiUser;
  role: UserRoleType;
}

export interface IApiProjectCustomerDetails {
  customerName: string | null;
  customerCity: string | null;
  customerUnit: string | null;
  customerFloor: number | null;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  customerApartment: string | null;
  customerCompanyNumber: string | null;
  customerAssociationNumber: string | null;
}

export type CustomerDetailFieldType = keyof IApiProjectCustomerDetails;

export interface IApiProjectIntake {
  address: string | null;
  contactName: string | null;
  contactRole: string | null;
  addressCity: string | null;
  contactPhone: string | null;
  addressPlaceId: string | null;
  paymentTermsNote: string | null;
  paymentTerms: PaymentTermsType | null;
}

export type InheritedProjectFieldType = keyof Pick<
  IApiProjectIntake,
  "address" | "addressCity" | "paymentTerms" | "addressPlaceId" | "paymentTermsNote"
>;

export interface IApiCustomerReference {
  id: string;
  name: string;
}

export interface IApiProjectReference {
  id: string;
  code: string;
  name: string;
  customer?: IApiCustomerReference | null;
}

export interface IApiProject extends IApiProjectCustomerDetails, IApiProjectIntake {
  id: string;
  code: string;
  name: string;
  stageId: string;
  updatedAt: string;
  notes: string | null;
  hasOwnTeam?: boolean;
  projectTypeId: string;
  apartmentCount?: number;
  stage?: IApiProjectStage;
  customerId: string | null;
  priorityId: string | null;
  parentNotes?: string | null;
  driveFolderId: string | null;
  projectType?: IApiProjectType;
  members?: IApiProjectMember[];
  customer?: IApiCustomer | null;
  parentProjectId: string | null;
  apartmentCredit?: string | null;
  prioritySyncedAt: string | null;
  parentProject?: IApiProjectReference;
  inheritedFields?: InheritedProjectFieldType[];
  apartmentOwnership?: ApartmentOwnershipType | null;
}

export type TCountsByStageId = Record<string, number>;

export interface IProjectStageCounts {
  total: number;
  byStage: TCountsByStageId;
}

export interface IApiStageTransition {
  id: string;
  createdAt: string;
  toStageId: string;
  note: string | null;
  changedBy?: IApiUser;
  toStage?: IApiProjectStage;
  changedByRole: UserRoleType;
}

export interface IApiDriveItem {
  id: string;
  name: string;
  mimeType: string;
  isFolder: boolean;
  size: number | null;
  webViewLink: string | null;
  modifiedTime: string | null;
}

export interface IApiDriveFolder {
  id: string;
  name: string;
  fileCount: number | null;
  contentStatus: FolderContentStatusType;
}

export interface IApiDriveContents {
  folderId: string;
  files: IApiDriveItem[];
  folders: IApiDriveFolder[];
}

export type TUserRoleCounts = Record<UserRoleType, number>;

export interface IApiPlaceSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string | null;
}

export interface IApiPlaceAddress {
  placeId: string;
  city: string | null;
  formattedAddress: string;
  countryCode: string | null;
}

export interface IApiCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  taxId: string;
  address: string;
  createdAt: string;
  contactName: string;
  createdBy?: IApiUser;
  priorityId: string | null;
  prioritySyncAttempts: number;
  contacts?: ICustomerContact[];
  prioritySyncedAt: string | null;
  prioritySyncError: string | null;
  customerType: ProjectDetailFieldSetType;
  prioritySyncStatus: PrioritySyncStatusType;
}

export type TCustomerSyncStatusCounts = Record<PrioritySyncStatusType, number>;

export interface IApiApartmentPage extends ICursorPage<IApiProject> {
  total: number;
}
