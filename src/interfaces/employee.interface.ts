import type { IPerson } from "./person.interface";
import type { UserRoleType } from "../constants/user-role.constant";

export interface IEmployee {
  id: string;
  phone: string;
  email: string;
  person: IPerson;
  role: UserRoleType;
  isDisabled: boolean;
}

export interface IEmployeeFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRoleType;
}

export interface IEmployeeFilter {
  id: string;
  label: string;
  role: UserRoleType | null;
}

export interface IRoleAssignment {
  id: string;
  role: IPerson;
  assignee: string;
  options: string[];
}
