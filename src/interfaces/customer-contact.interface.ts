export interface ICustomerContactInput {
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
}

export interface ICustomerContact extends ICustomerContactInput {
  id: string;
  customerId: string;
}

export interface ICustomerContactDraft {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface ICustomerContactEditor {
  id: string | null;
  values: ICustomerContactDraft;
}

export interface ICustomerContactSave {
  customerId: string;
  editor: ICustomerContactEditor;
}
