export interface ILinkableProject {
  id: string;
  name: string;
  code: string;
  customerId: string | null;
  parentProjectId: string | null;
  customer: { id: string; name: string } | null;
}

export interface ICustomerProjectLinkInput {
  projectId: string;
  expectedCustomerId: string | null;
}
