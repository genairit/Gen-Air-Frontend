import type { IApiProjectCustomerDetails } from "./api.interface";
import type { UserRoleType } from "../constants/user-role.constant";

export interface IProjectQuery {
  search: string;
  managerId: string | null;
  projectTypeId: string | null;
}

interface IProjectMemberAssignment {
  userId: string;
  role: UserRoleType;
}

export interface IProjectPayload extends Partial<IApiProjectCustomerDetails> {
  name: string;
  stageId?: string;
  projectTypeId: string;
  members: IProjectMemberAssignment[];
}

export interface IUserQuery {
  search: string;
  role: UserRoleType | null;
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
