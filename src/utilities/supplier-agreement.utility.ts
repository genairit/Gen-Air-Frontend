import { todayDateInput } from "./date.utility";
import type { ISupplierAgreement } from "../interfaces/supplier-agreement.interface";
import type { ISupplierInput, IAgreementInput } from "../interfaces/supplier-agreement.interface";
import type { IPurchaseLine, IPurchaseHistoryLine } from "../interfaces/purchase-record.interface";

export const normalizeSupplierInput = (input: ISupplierInput): ISupplierInput => ({
  ...input,
  name: input.name.trim(),
  contactName: input.contactName?.trim() || null,
  phone: input.phone?.trim() || null,
  email: input.email?.trim() || null,
});

export const normalizeAgreementInput = (input: IAgreementInput): IAgreementInput => ({
  ...input,
  agreedQuantity: input.agreedQuantity?.trim() || null,
  effectiveFrom: input.effectiveFrom?.trim() || null,
  effectiveThrough: input.effectiveThrough?.trim() || null,
});

export const matchingAgreement = (
  agreements: ISupplierAgreement[],
  line: IPurchaseLine | IPurchaseHistoryLine,
  supplierId: string,
  orderDate: string,
): ISupplierAgreement | null => {
  const date = orderDate || todayDateInput();
  return (
    agreements.find(
      agreement =>
        agreement.active &&
        agreement.supplierId === supplierId &&
        agreement.boqSourceKey === ("sourceKey" in line ? line.sourceKey : line.boqSourceKey) &&
        agreement.materialId === line.materialId &&
        agreement.materialUnit === line.materialUnit &&
        (!agreement.effectiveFrom || date >= agreement.effectiveFrom) &&
        (!agreement.effectiveThrough || date <= agreement.effectiveThrough),
    ) ?? null
  );
};

export const formatAgreementPrice = (agreement: ISupplierAgreement): string =>
  `${Number(agreement.unitPrice).toLocaleString("he-IL", { maximumFractionDigits: 4 })} ${agreement.currencyCode}`;
