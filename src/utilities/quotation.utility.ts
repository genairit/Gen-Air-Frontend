import {
  CONTROL_KIND,
  EQUIPMENT_ROLE,
  QUOTATION_TYPES,
  QUOTATION_SYSTEM,
  QUOTATION_GENERAL_TAB_ID,
} from "../constants/quotation.constant";

import type {
  IQuotation,
  IQuotationLine,
  ICatalogueItem,
  IQuotationSection,
} from "../interfaces/quotation.interface";

import { QUOTATION_DECIMAL } from "../constants/quotation.constant";
import type { TQuotationSystem } from "../interfaces/quotation.interface";
import type { IQuotationSavePayload } from "../interfaces/quotation.interface";

export const quotationMoney = (value: string): string => {
  const rounded = new QUOTATION_DECIMAL(value).toDecimalPlaces(2);
  const [whole, fraction] = rounded.abs().toFixed(2).split(".");
  const sign = rounded.isNegative() && !rounded.isZero() ? "-" : "";
  return `${sign}₪${BigInt(whole).toLocaleString("he-IL")}.${fraction}`;
};
export const quotationLineMoney = (line: IQuotationLine): string =>
  quotationMoney(new QUOTATION_DECIMAL(line.quantity).times(line.quotedPrice).toString());
export const quotationPayload = (quotation: IQuotation): IQuotationSavePayload => {
  const {
    version,
    customerId,
    projectId,
    date,
    brand,
    brands,
    paymentTerms,
    paymentTermsNote,
    paymentSchedule,
    discountPercent,
    targetPretaxAmount,
    internalNotes,
  } = quotation;
  return {
    version,
    customerId,
    projectId,
    date,
    brand,
    brands,
    paymentTerms,
    paymentTermsNote,
    paymentSchedule,
    discountPercent,
    targetPretaxAmount,
    internalNotes,
    sections: quotation.sections.map(section => ({
      id: section.id,
      title: section.title,
      systemType: section.systemType,
      brand: section.brand,
      items: section.items.map(item => ({
        id: item.id,
        catalogueItemId: item.catalogueItemId,
        parentItemId: item.parentItemId,
        description: item.description,
        quotedPrice: item.quotedPrice,
        quantity: item.quantity,
        location: item.location,
        circuit: item.circuit,
        requestedCapacityBtu: item.requestedCapacityBtu,
      })),
    })),
  };
};
export const catalogueLine = (
  item: ICatalogueItem,
  requestedCapacityBtu: number | null,
): IQuotationLine => {
  return {
    id: crypto.randomUUID(),
    catalogueItemId: item.id,
    parentItemId: null,
    equipmentType: item.equipmentTypes[0] ?? null,
    controlKind: catalogueControlKind(item),
    sku: item.sku,
    description: item.description,
    unit: item.unit,
    quotedPrice: item.price,
    quantity: "1",
    location: "",
    circuit: [EQUIPMENT_ROLE.INDOOR, EQUIPMENT_ROLE.OUTDOOR].some(
      role => role === item.equipmentRole,
    )
      ? "A"
      : null,
    requestedCapacityBtu,
    capacityBtu: item.capacityBtu,
    equipmentRole: item.equipmentRole,
    includesRemote: item.includesRemote,
    includesThermostat: item.includesThermostat,
  };
};
export const updateQuotationSection = (
  quotation: IQuotation,
  section: IQuotationSection,
): IQuotation => {
  return {
    ...quotation,
    sections: quotation.sections.map(current => (current.id === section.id ? section : current)),
  };
};
export const updateQuotationLine = (
  section: IQuotationSection,
  line: IQuotationLine,
): IQuotationSection => ({
  ...section,
  items: section.items.map(current => {
    if (current.id === line.id) {
      return line;
    }
    if (current.parentItemId === line.id) {
      return { ...current, quantity: line.quantity };
    }
    return current;
  }),
});
export const removeQuotationLine = (section: IQuotationSection, id: string): IQuotationSection => {
  return {
    ...section,
    items: section.items.filter(item => item.id !== id && item.parentItemId !== id),
  };
};
export const moveQuotationSection = (
  quotation: IQuotation,
  index: number,
  direction: number,
): IQuotation => {
  const section = quotation.sections[index];
  if (!section) {
    return quotation;
  }
  const siblingIndexes = quotation.sections.flatMap((current, position) =>
    current.brand === section.brand ? [position] : [],
  );
  const siblingPosition = siblingIndexes.indexOf(index);
  const target = siblingIndexes[siblingPosition + direction];
  if (target === undefined) {
    return quotation;
  }
  const sections = [...quotation.sections];
  [sections[index], sections[target]] = [sections[target], sections[index]];
  return { ...quotation, sections };
};

export const quotationBrandTabs = (quotation: IQuotation, activeId: string) => {
  const selectedId =
    activeId === QUOTATION_GENERAL_TAB_ID || quotation.brands.includes(activeId)
      ? activeId
      : (quotation.brands[0] ?? QUOTATION_GENERAL_TAB_ID);
  const brand = selectedId === QUOTATION_GENERAL_TAB_ID ? null : selectedId;
  return {
    brand,
    selectedId,
    items: [
      ...quotation.brands.map(value => ({ id: value, label: value })),
      { id: QUOTATION_GENERAL_TAB_ID, label: "כללי" },
    ],
    sections: quotation.sections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => section.brand === brand),
  };
};

export const addQuotationBrand = (quotation: IQuotation, brand: string): IQuotation => {
  if (!brand || quotation.brands.includes(brand)) return quotation;
  const brands = [...quotation.brands, brand];
  return { ...quotation, brands, brand: brands[0] };
};

export const removeEmptyQuotationBrand = (quotation: IQuotation, brand: string): IQuotation => {
  if (
    !quotation.brands.includes(brand) ||
    quotation.sections.some(section => section.brand === brand)
  ) {
    return quotation;
  }
  const brands = quotation.brands.filter(value => value !== brand);
  return { ...quotation, brands, brand: brands[0] ?? "" };
};

export const catalogueControlKind = (item: ICatalogueItem): string | null => {
  if (item.equipmentRole !== EQUIPMENT_ROLE.CONTROL) {
    return null;
  }
  return /^שלט/.test(item.description) ? CONTROL_KIND.REMOTE : CONTROL_KIND.THERMOSTAT;
};
export const requestedQuotationCapacity = (value: string): number | null => {
  const raw = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(raw) || raw <= 0) {
    return null;
  }
  return Math.round(raw < 200 ? raw * 1000 : raw);
};
export const quotationEquipmentTypes = (system: string, role: string): string[] => {
  if (role === EQUIPMENT_ROLE.OUTDOOR) {
    return QUOTATION_TYPES.OUTDOOR;
  }
  if (system === QUOTATION_SYSTEM.SINGLE) {
    return QUOTATION_TYPES.SINGLE;
  }
  return QUOTATION_TYPES.INDOOR;
};

export const initialQuotationRole = (system: TQuotationSystem): string =>
  ({
    [QUOTATION_SYSTEM.VRF]: EQUIPMENT_ROLE.INDOOR,
    [QUOTATION_SYSTEM.MULTI]: EQUIPMENT_ROLE.INDOOR,
    [QUOTATION_SYSTEM.SINGLE]: EQUIPMENT_ROLE.UNIT,
    [QUOTATION_SYSTEM.GENERAL]: "",
  })[system];

export const quotationControlParents = (
  items: IQuotationLine[],
  line: IQuotationLine,
): IQuotationLine[] =>
  items.filter(
    parent =>
      parent.equipmentRole === EQUIPMENT_ROLE.INDOOR &&
      !(parent.includesRemote && line.controlKind === CONTROL_KIND.REMOTE) &&
      !(parent.includesThermostat && line.controlKind === CONTROL_KIND.THERMOSTAT),
  );
export const reparentQuotationControl = ({
  line,
  items,
  parentItemId,
}: {
  line: IQuotationLine;
  items: IQuotationLine[];
  parentItemId: string | null;
}): IQuotationLine => {
  const parent = quotationControlParents(items, line).find(
    candidate => candidate.id === parentItemId,
  );
  return { ...line, parentItemId, quantity: parent?.quantity ?? line.quantity };
};
