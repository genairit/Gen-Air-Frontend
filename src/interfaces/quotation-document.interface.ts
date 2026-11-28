export interface IQuotationDocumentParty {
  name: string;
  city: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface IQuotationDocumentCompany extends IQuotationDocumentParty {
  vatFileNumber: string;
  businessNumber: string;
}
interface IQuotationDocumentRecipient extends IQuotationDocumentParty {
  customerNumber: string | null;
}
interface IQuotationDocumentProject {
  name: string | null;
  address: string | null;
}
interface IQuotationRecipientContext {
  customerId: string;
  projectId: string | null;
  salesAgentId: string | null;
}
interface IQuotationDocumentMetadata {
  vatFileNumber: string;
  customerTaxLabel: string;
  validUntil: string | null;
  salesAgent: string | null;
  customerTaxId: string | null;
}
interface IQuotationDocumentTerms {
  approval: string;
  general: string[];
  delivery: string[];
  warranty: string[];
  additional: string[];
}

type TPaymentTermLabels = Record<string, string>;

export interface IQuotationDocumentContext {
  title: string;
  printDate: string;
  issuerName: string;
  defaultPayment: string[];
  terms: IQuotationDocumentTerms;
  company: IQuotationDocumentCompany;
  project: IQuotationDocumentProject;
  metadata: IQuotationDocumentMetadata;
  paymentTermLabels: TPaymentTermLabels;
  recipient: IQuotationDocumentRecipient;
  recipientContext: IQuotationRecipientContext;
}
