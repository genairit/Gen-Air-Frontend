import {
  PURCHASE_ALL_CATEGORY,
  PURCHASE_RECORD_STATUS,
  type TPurchaseRecordStatus,
} from "../constants/purchase-record.constant";

import Decimal from "decimal.js";
import type { IPurchaseLine } from "../interfaces/purchase-record.interface";

export const formatPurchaseQuantity = (value: string | null): string => {
  if (value === null) {
    return "לא נקבע";
  }

  return new Decimal(value).toString();
};

export const getPurchaseLineStatus = (line: IPurchaseLine): string => {
  const ordered = new Decimal(line.orderedQuantity);
  const requested = new Decimal(line.requestedQuantity);
  const overrun = new Decimal(line.overrunQuantity);
  const remaining = line.remainingQuantity === null ? null : new Decimal(line.remainingQuantity);

  if (ordered.eq(0)) {
    return "לא הוזמן";
  }

  if (overrun.gt(0)) {
    return "הוזמן · חריגה";
  }

  if (remaining?.eq(0) && requested.eq(0)) {
    return "הוזמן";
  }

  return "הוזמן חלקית";
};

export const matchesPurchaseLine = (
  line: IPurchaseLine,
  category: string,
  search: string,
): boolean => {
  const inCategory = category === PURCHASE_ALL_CATEGORY || line.materialCategory === category;
  const haystack =
    `${line.materialName} ${line.materialCode} ${line.componentTitle} ${line.systemTitle}`.toLocaleLowerCase(
      "he-IL",
    );
  return inCategory && haystack.includes(search.toLocaleLowerCase("he-IL"));
};

export const hasPurchaseOverrun = (line: IPurchaseLine): boolean =>
  new Decimal(line.overrunQuantity).gt(0);

export const canCancelPurchaseRecord = (
  status: TPurchaseRecordStatus,
  canRequest: boolean,
  canOrder: boolean,
): boolean => {
  if (status === PURCHASE_RECORD_STATUS.CANCELLED) {
    return false;
  }

  const requiresApproval =
    status === PURCHASE_RECORD_STATUS.APPROVED || status === PURCHASE_RECORD_STATUS.ORDERED;
  return requiresApproval ? canOrder : canRequest;
};
