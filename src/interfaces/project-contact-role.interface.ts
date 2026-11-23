import type { ICustomerContact } from "./customer-contact.interface";
import type { ProjectContactRoleType } from "../constants/project-contact-role.constant";

export type TProjectRoleContacts = Record<ProjectContactRoleType, ICustomerContact | null>;

export interface IProjectRoleContactChange {
  role: ProjectContactRoleType;
  contact: ICustomerContact | null;
}
