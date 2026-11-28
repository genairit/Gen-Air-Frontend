import type { UserRoleType } from "../constants/user-role.constant";
import type { IProjectContactInput } from "./project-contact.interface";
import type { PrioritySyncStatusType } from "../constants/priority-sync.constant";
import type { IApiProjectIntake, IApiProjectCustomerDetails } from "./api.interface";

export interface IProjectQuery {
  search: string;
  managerId: string | null;
  projectTypeId: string | null;
}

export interface IProjectPageQuery extends IProjectQuery {
  stageId: string | null;
}

export interface IProjectStageMovePayload {
  note?: string;
  stageId: string;
}

export interface IProjectMemberAssignment {
  userId: string;
  role: UserRoleType;
}

export type TProjectIntakePayload = Partial<Omit<IApiProjectIntake, "address" | "addressCity">>;

export interface IProjectPayload
  extends Partial<IApiProjectCustomerDetails>, TProjectIntakePayload {
  name: string;
  stageId?: string;
  stageNote?: string;
  customerId: string;
  notes: string | null;
  projectTypeId: string;
  existingDriveFolder?: string;
  members: IProjectMemberAssignment[];
  hasGeneralLightingCeilingLowering?: boolean;
  generalLightingCeilingLoweringHeight?: number | null;
  contacts?: { contactId: string; role: string | null; isPrimary: boolean }[];
}

export interface IUserQuery {
  search: string;
  role: UserRoleType | null;
}

export interface ICustomerQuery {
  search: string;
  prioritySyncStatus: PrioritySyncStatusType | null;
}

export interface IUserPayload {
  email: string;
  phone: string;
  lastName: string;
  password: string;
  firstName: string;
  assignedRoles: UserRoleType[];
}

export type TUserUpdatePayload = Partial<Omit<IUserPayload, "password">>;

export interface IUpdatePasswordPayload {
  password: string;
  currentPassword: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface IAddressSearch {
  input: string;
  signal: AbortSignal;
  sessionToken: string;
}

export interface IAddressLookup {
  placeId: string;
  sessionToken: string;
}

export interface IApartmentQuery {
  search: string;
  stageId: string | null;
}

export interface IApartmentPayload {
  customerId: string;
  customerFloor: number;
  hasOwnLighting?: boolean;
  customerApartment: string;
  existingDriveFolder?: string;
  engineerUserId?: string | null;
  contacts?: IProjectContactInput[];
  members?: IProjectMemberAssignment[];
  hasGeneralLightingCeilingLowering?: boolean;
  generalLightingCeilingLoweringHeight?: number | null;
}

export interface IApartmentChanges {
  hasOwnTeam?: boolean;
  notes?: string | null;
  hasOwnLighting?: boolean;
  engineerUserId?: string | null;
  members?: IProjectMemberAssignment[];
  hasGeneralLightingCeilingLowering?: boolean;
  generalLightingCeilingLoweringHeight?: number | null;
}
