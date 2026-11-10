import type {
  TQuotationProjectKind,
  TQuotationProjectRole,
} from "../constants/quotation-sharing.constant";

import type { TQuotationStatus, TQuotationSystem } from "../constants/quotation.constant";

export type { TQuotationStatus, TQuotationSystem } from "../constants/quotation.constant";

export interface ICatalogueItem {
  id: string;
  sku: string;
  unit: string;
  price: string;
  brand: string;
  status: string;
  preference: string;
  description: string;
  equipmentRole: string;
  includesRemote: boolean;
  equipmentTypes: string[];
  systemType: string | null;
  capacityBtu: number | null;
  includesThermostat: boolean;
}
export interface IQuotationLine {
  id: string;
  sku: string;
  unit: string;
  quantity: string;
  location: string;
  description: string;
  quotedPrice: string;
  equipmentRole: string;
  circuit: string | null;
  catalogueItemId: string;
  includesRemote: boolean;
  controlKind: string | null;
  capacityBtu: number | null;
  parentItemId: string | null;
  includesThermostat: boolean;
  equipmentType: string | null;
  requestedCapacityBtu: number | null;
}
export interface IQuotationSection {
  id: string;
  title: string;
  brand: string | null;
  items: IQuotationLine[];
  systemType: TQuotationSystem;
}
export interface IQuotationWarning {
  key: string;
  text: string;
  acknowledged: boolean;
}
export interface IQuotation {
  id: string;
  date: string;
  brand: string;
  number: string;
  vatRate: string;
  version: number;
  brands: string[];
  updatedAt: string;
  customerId: string;
  customerName?: string;
  internalNotes: string;
  discountPercent: string;
  projectId: string | null;
  status: TQuotationStatus;
  paymentTermsNote: string;
  projectName?: string | null;
  paymentTerms: string | null;
  sections: IQuotationSection[];
  warnings: IQuotationWarning[];
  targetPretaxAmount: string | null;
  apartmentLinks?: IQuotationApartmentLink[];
  primaryProject?: IQuotationPrimaryProject | null;
  paymentSchedule: {
    percent: string;
    text: string;
  }[];
  totals: {
    subtotal: string;
    discount: string;
    pretax: string;
    vat: string;
    total: string;
  };
}

export interface IQuotationPrimaryProject {
  id: string;
  name: string;
  code: string;
  kind: TQuotationProjectKind;
}
export interface IQuotationApartment {
  apartmentId: string;
  floor: number | null;
  apartmentNumber: string | null;
  endCustomerName: string | null;
}
export interface IQuotationApartmentLink extends IQuotationApartment {
  available: boolean;
}
export interface IQuotationApartmentOptions {
  apartments: IQuotationApartment[];
  building: IQuotationPrimaryProject;
}
export interface IProjectQuotation extends IQuotation {
  sharedCount: number;
  sharedFromCode: string | null;
  sharedApartmentNumbers: string[];
  projectRole: TQuotationProjectRole;
}
export interface IProjectQuotationPage {
  total: number;
  nextCursor: string | null;
  items: IProjectQuotation[];
}
export interface IQuotationPage {
  items: IQuotation[];
  nextCursor: string | null;
}
export interface IQuotationListQuery {
  search: string;
  batchCursor: string | null;
  status: TQuotationStatus | null;
}

export interface IQuotationEditorState {
  busy: boolean;
  dirty: boolean;
  deleted: boolean;
  retry: () => void;
  commandBusy: boolean;
  error: string | null;
  quotation: IQuotation;
  deleteError: string | null;
  remove: () => Promise<void>;
  reload: () => Promise<void>;
  update: (quotation: IQuotation) => void;
  acknowledge: (keys: string[]) => Promise<void>;
  transition: (status: TQuotationStatus) => Promise<boolean>;
}
export interface IQuotationProjectChoice {
  id: string;
  name: string;
}
export type TQuotationSaveLine = Pick<
  IQuotationLine,
  | "id"
  | "catalogueItemId"
  | "parentItemId"
  | "description"
  | "quotedPrice"
  | "quantity"
  | "location"
  | "circuit"
  | "requestedCapacityBtu"
>;
export interface IQuotationSaveSection extends Pick<
  IQuotationSection,
  "id" | "title" | "systemType" | "brand"
> {
  items: TQuotationSaveLine[];
}
export interface IQuotationSavePayload extends Pick<
  IQuotation,
  | "version"
  | "customerId"
  | "projectId"
  | "date"
  | "brand"
  | "brands"
  | "paymentTerms"
  | "paymentTermsNote"
  | "paymentSchedule"
  | "discountPercent"
  | "targetPretaxAmount"
  | "internalNotes"
> {
  sections: IQuotationSaveSection[];
}

export interface IQuotationStatusCounts {
  all: number;
  draft: number;
  review: number;
  approved: number;
}
export interface IQuotationCircuit {
  id: string;
  key: string;
  indoor: string;
  outdoor: string;
  ratio: string | null;
}

export interface IQuotationPaymentRow {
  text: string;
  amount: string;
  percent: string;
}
export interface IQuotationReviewSection {
  id: string;
  title: string;
  items: (IQuotationLine & { amount: string; priceLabel: string; quantityLabel: string })[];
}

export interface IQuotationLineGroup {
  line: IQuotationLine;
  controls: IQuotationLine[];
}
