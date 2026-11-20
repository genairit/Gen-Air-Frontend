export interface ISupplier {
  id: string;
  name: string;
  notes: string;
  active: boolean;
  version: number;
  phone: string | null;
  email: string | null;
  contactName: string | null;
}

export interface ISupplierInput {
  name: string;
  notes?: string;
  active?: boolean;
  phone?: string | null;
  email?: string | null;
  expectedVersion?: number;
  contactName?: string | null;
}

export interface ISupplierAgreement {
  id: string;
  notes: string;
  active: boolean;
  version: number;
  projectId: string;
  unitPrice: string;
  materialId: string;
  supplierId: string;
  boqSourceKey: string;
  materialUnit: string;
  supplierName: string;
  currencyCode: string;
  effectiveFrom: string | null;
  agreedQuantity: string | null;
  effectiveThrough: string | null;
}

export interface IAgreementInput {
  notes?: string;
  active?: boolean;
  unitPrice: string;
  boqLineId?: string;
  supplierId?: string;
  currencyCode: string;
  expectedVersion?: number;
  effectiveFrom?: string | null;
  agreedQuantity?: string | null;
  effectiveThrough?: string | null;
}

export interface IAgreementRevision {
  version: number;
  actorId: string;
  createdAt: string;
  snapshot: ISupplierAgreement;
}
