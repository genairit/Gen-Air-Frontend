import type { IBoqLine } from "./project-boq.interface";
import type { TPurchaseRecordStatus } from "../constants/purchase-record.constant";

export interface IPurchaseLine extends Omit<
  IBoqLine,
  "requestedQuantity" | "orderedQuantity" | "remainingQuantity"
> {
  ordered: boolean;
  overrunQuantity: string;
  orderedQuantity: string;
  requestedQuantity: string;
  remainingQuantity: string | null;
}

export interface IPurchaseHistoryLine {
  id: string;
  quantity: string;
  materialId: string;
  materialName: string;
  materialUnit: string;
  boqSourceKey: string;
  currencyCode: string;
  activeQuantity: string;
  unitCost: string | null;
  supplierAgreementId: string | null;
  supplierAgreementVersion: number | null;
}

export interface IPurchaseHistoryEvent {
  id: string;
  action: string;
  reason: string;
  actorId: string;
  createdAt: string;
  nextStatus: TPurchaseRecordStatus;
  previousStatus: TPurchaseRecordStatus | null;
}

export interface IPurchaseHistory {
  id: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  updatedById: string;
  orderDate: string | null;
  onBehalfOf: string | null;
  supplierId: string | null;
  supplierName: string | null;
  supplierPhone: string | null;
  supplierEmail: string | null;
  status: TPurchaseRecordStatus;
  lines: IPurchaseHistoryLine[];
  exceptionReason: string | null;
  events: IPurchaseHistoryEvent[];
  supplierContactName: string | null;
}

export interface IPurchaseWorkspace {
  revision: number;
  projectId: string;
  lines: IPurchaseLine[];
  nextCursor: string | null;
  history: IPurchaseHistory[];
}

export interface IPurchaseInputLine {
  quantity: string;
  boqLineId: string;
  unitCost?: string;
  agreementId?: string;
  agreementVersion?: number;
}

export interface ICreatePurchaseInput {
  notes?: string;
  orderDate?: string;
  onBehalfOf?: string;
  supplierId?: string;
  supplierName?: string;
  idempotencyKey: string;
  exceptionReason?: string;
  lines: IPurchaseInputLine[];
}

export interface ITransitionPurchaseInput {
  reason: string;
  orderDate?: string;
  supplierId?: string;
  supplierName?: string;
  idempotencyKey: string;
  lines?: {
    recordLineId: string;
    agreementId: string;
    agreementVersion: number;
    unitCost: string;
  }[];
}
