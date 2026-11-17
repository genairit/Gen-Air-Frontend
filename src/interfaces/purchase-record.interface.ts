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
  materialName: string;
  materialUnit: string;
  boqSourceKey: string;
  currencyCode: string;
  activeQuantity: string;
  unitCost: string | null;
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
  supplierName: string | null;
  status: TPurchaseRecordStatus;
  lines: IPurchaseHistoryLine[];
  exceptionReason: string | null;
  events: IPurchaseHistoryEvent[];
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
}

export interface ICreatePurchaseInput {
  notes?: string;
  orderDate?: string;
  onBehalfOf?: string;
  supplierName?: string;
  idempotencyKey: string;
  exceptionReason?: string;
  lines: IPurchaseInputLine[];
}
