export interface IBoqSource {
  id: string;
  number: string;
  version: number;
}
export interface IBoqMaterial {
  id: string;
  code: string;
  name: string;
  unit: string;
  category: string;
  specification: string | null;
}
export interface IBoqLine {
  id: string;
  notes: string;
  sourceKey: string;
  materialId: string;
  systemTitle: string;
  sourceBasis: string;
  reviewState: string;
  materialCode: string;
  materialName: string;
  materialUnit: string;
  displayOrder: number;
  orderedQuantity: null;
  componentTitle: string;
  requestedQuantity: null;
  remainingQuantity: null;
  materialCategory: string;
  quantityOverridden: boolean;
  proposedQuantity: string | null;
  requiredQuantity: string | null;
  estimatedUnitCost: string | null;
  estimatedLineCost: string | null;
  materialSpecification: string | null;
}
export interface IProjectBoq {
  revision: number;
  projectId: string;
  lines: IBoqLine[];
  estimatedTotal: string;
  ledgerAvailable: false;
  unresolvedCount: number;
  updatedAt: string | null;
  missingCostCount: number;
  sourceQuotationId: string | null;
  sourceQuotationNumber: string | null;
  sourceQuotationVersion: number | null;
}
export interface IBoqPreview {
  added: string[];
  lines: IBoqLine[];
  changed: string[];
  removed: string[];
  quotationId: string;
  fingerprint: string;
  includedCount: number;
  quotationNumber: string;
  quotationVersion: number;
  unmappedCatalogueItems: string[];
}
export interface IBoqRevision {
  revision: number;
  lines: IBoqLine[];
  createdAt: string;
  sourceQuotationId: string | null;
  sourceQuotationVersion: number | null;
}
export interface IBoqLineEdit {
  notes: string;
  reviewState: string;
  expectedRevision: number;
  requiredQuantity: string | null;
  estimatedUnitCost: string | null;
}
export interface IBoqLineAdd extends IBoqLineEdit {
  materialId: string;
  systemTitle: string;
  componentTitle: string;
}
