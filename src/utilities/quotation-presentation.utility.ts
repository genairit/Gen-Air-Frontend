import {
  EQUIPMENT_ROLE,
  QUOTATION_SYSTEM,
  QUOTATION_DECIMAL,
  QUOTATION_SYSTEM_LABELS,
} from "../constants/quotation.constant";

import type {
  IQuotation,
  IQuotationLine,
  IQuotationSection,
  IQuotationCircuit,
  IQuotationPaymentRow,
  IQuotationReviewSection,
} from "../interfaces/quotation.interface";

import type Decimal from "decimal.js";
import { formatRelativeTime } from "./date.utility";
import { isDecimal } from "./guards/quotation.guard";
import { QUOTATION_DEFAULTS } from "../constants/quotation.constant";
import { quotationMoney, quotationLineMoney } from "./quotation.utility";
import type { IQuotationLineGroup } from "../interfaces/quotation.interface";

export const quotationSaveLabel = ({
  busy,
  dirty,
  updatedAt,
}: {
  busy: boolean;
  dirty: boolean;
  updatedAt: string;
}): string => {
  if (busy) {
    return "שומר...";
  }
  if (dirty) {
    return "שינויים ממתינים לשמירה";
  }
  return `נשמר בשרת · ${formatRelativeTime(updatedAt)}`;
};
export const quotationSectionAmount = (section: IQuotationSection): string => {
  const extension = (line: IQuotationLine): Decimal =>
    new QUOTATION_DECIMAL(line.quantity || 0).times(line.quotedPrice || 0).toDecimalPlaces(2);
  return section.items
    .reduce((total, line) => total.plus(extension(line)), new QUOTATION_DECIMAL(0))
    .toFixed(2);
};
const circuitCapacity = (lines: IQuotationLine[], role: string): Decimal =>
  lines
    .filter(line => line.equipmentRole === role)
    .reduce(
      (total, line) =>
        total.plus(new QUOTATION_DECIMAL(line.quantity || 0).times(line.capacityBtu ?? 0)),
      new QUOTATION_DECIMAL(0),
    );
const sectionCircuits = (section: IQuotationSection): IQuotationCircuit[] => {
  const equipment = section.items.filter(
    line =>
      line.equipmentRole === EQUIPMENT_ROLE.INDOOR || line.equipmentRole === EQUIPMENT_ROLE.OUTDOOR,
  );
  const firstCircuit = QUOTATION_DEFAULTS.CIRCUIT;
  const keys = [...new Set(equipment.map(line => line.circuit ?? firstCircuit))];
  return keys.map(circuit => {
    const lines = equipment.filter(line => (line.circuit ?? firstCircuit) === circuit);
    const indoor = circuitCapacity(lines, EQUIPMENT_ROLE.INDOOR);
    const outdoor = circuitCapacity(lines, EQUIPMENT_ROLE.OUTDOOR);
    return {
      id: `${section.id}:${circuit}`,
      key: `${section.title || QUOTATION_SYSTEM.VRF} · ${circuit}`,
      indoor: indoor.toFixed(0),
      outdoor: outdoor.toFixed(0),
      ratio: outdoor.gt(0) ? indoor.div(outdoor).toFixed(2) : null,
    };
  });
};
export const quotationCircuits = (quotation: IQuotation): IQuotationCircuit[] =>
  quotation.sections
    .filter(section => section.systemType === QUOTATION_SYSTEM.VRF)
    .flatMap(sectionCircuits);
export const quotationOpeningLine = (quotation: IQuotation): string | null =>
  quotation.sections
    .flatMap(section => section.items)
    .find(line => line.equipmentRole === EQUIPMENT_ROLE.OTHER)?.description ?? null;
export const quotationDecimalInput = (value: string): string =>
  isDecimal(value) ? new QUOTATION_DECIMAL(value).toString() : value;
export const quotationPaymentRows = (quotation: IQuotation): IQuotationPaymentRow[] =>
  quotation.paymentSchedule.map(stage => ({
    ...stage,
    amount: quotationMoney(
      new QUOTATION_DECIMAL(quotation.totals.total)
        .times(stage.percent || 0)
        .div(100)
        .toDecimalPlaces(2)
        .toFixed(2),
    ),
  }));
export const quotationPaymentTotal = (quotation: IQuotation): string =>
  quotation.paymentSchedule
    .reduce((total, stage) => total.plus(stage.percent || 0), new QUOTATION_DECIMAL(0))
    .toString();
export const quotationReviewSections = (quotation: IQuotation): IQuotationReviewSection[] =>
  quotation.sections.map(section => ({
    id: section.id,
    title: `${section.brand ?? "כללי"} · ${section.title || QUOTATION_SYSTEM_LABELS[section.systemType]}`,
    items: section.items.map(line => ({
      ...line,
      amount: quotationLineMoney(line),
      priceLabel: quotationMoney(line.quotedPrice),
      quantityLabel: quotationDecimalInput(line.quantity),
    })),
  }));

export const quotationLineGroups = (section: IQuotationSection): IQuotationLineGroup[] =>
  section.items
    .filter(
      line => !line.parentItemId || !section.items.some(parent => parent.id === line.parentItemId),
    )
    .map(line => ({
      line,
      controls: section.items.filter(control => control.parentItemId === line.id),
    }));
