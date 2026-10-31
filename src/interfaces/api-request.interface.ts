import type { UserRoleType } from "../constants/user-role.constant";
import type { PaymentTermsType } from "../constants/payment-terms.constant";
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

export interface IProjectMemberAssignment {
  userId: string;
  role: UserRoleType;
}

export type TProjectIntakePayload = Partial<Omit<IApiProjectIntake, "address" | "addressCity">>;

export interface IProjectPayload
  extends Partial<IApiProjectCustomerDetails>, TProjectIntakePayload {
  name: string;
  stageId?: string;
  customerId: string;
  projectTypeId: string;
  members: IProjectMemberAssignment[];
  hasGeneralLightingCeilingLowering?: boolean;
  generalLightingCeilingLoweringHeight?: number | null;
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
  customerApartment: string;
  paymentTerms?: PaymentTermsType;
  paymentTermsNote?: string | null;
  members?: IProjectMemberAssignment[];
}

export interface IApartmentChanges {
  hasOwnTeam?: boolean;
  notes?: string | null;
  paymentTermsNote?: string | null;
  members?: IProjectMemberAssignment[];
  paymentTerms?: PaymentTermsType | null;
}
