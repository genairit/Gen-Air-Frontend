import type { UserRoleType } from "../constants/user-role.constant";
import type { PrioritySyncStatusType } from "../constants/priority-sync.constant";
import type { IApiProjectIntake, IApiProjectCustomerDetails } from "./api.interface";

export interface IProjectQuery {
  search: string;
  managerId: string | null;
  projectTypeId: string | null;
}

interface IProjectMemberAssignment {
  userId: string;
  role: UserRoleType;
}

export type TProjectIntakePayload = Partial<Omit<IApiProjectIntake, "address" | "addressCity">>;

export interface IProjectPayload
  extends Partial<IApiProjectCustomerDetails>, TProjectIntakePayload {
  name: string;
  stageId?: string;
  projectTypeId: string;
  members: IProjectMemberAssignment[];
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
  role: UserRoleType;
}

export interface IProjectStagePayload {
  name: string;
  tag: string | null;
  description: string | null;
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
