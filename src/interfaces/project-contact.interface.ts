import type { ICustomerContact, ICustomerContactInput } from "./customer-contact.interface";

export interface IProjectContactLink {
  projectId: string;
  contactId: string;
  isPrimary: boolean;
  role: string | null;
  contact: ICustomerContact;
}

export interface IProjectContactInput {
  contactId: string;
  isPrimary: boolean;
  role: string | null;
}

export type IContactDirectoryInput = ICustomerContactInput;
