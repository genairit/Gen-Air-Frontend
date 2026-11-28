import type {
  IQuotation,
  IQuotationFloor,
  IQuotationSection,
  IQuotationFloorGroup,
} from "../interfaces/quotation.interface";

import { QUOTATION_ROW_COPY, QUOTATION_SYSTEM_LABELS } from "../constants/quotation.constant";

export const quotationFloors = (sections: IQuotationSection[]): IQuotationFloor[] => {
  const floors = new Map<string, IQuotationFloor>();
  for (const section of sections) {
    if (section.brand && section.floorId && section.floorName && !floors.has(section.floorId)) {
      floors.set(section.floorId, { floorId: section.floorId, floorName: section.floorName });
    }
  }
  return [...floors.values()];
};

export const quotationFloorGroups = (
  quotation: Pick<IQuotation, "sections" | "brands">,
): IQuotationFloorGroup[] => {
  const { sections } = quotation;
  const brands = [
    ...new Set([
      ...quotation.brands,
      ...sections.flatMap(section => (section.brand ? [section.brand] : [])),
    ]),
  ];
  const orderedFloors = [...quotationFloors(sections), { floorId: null, floorName: null }];
  const groups = orderedFloors
    .map(floor => ({
      ...floor,
      companies: brands
        .map(brand => ({
          brand,
          sections: sections.filter(
            section => section.brand === brand && (section.floorId ?? null) === floor.floorId,
          ),
        }))
        .filter(company => company.sections.length > 0),
    }))
    .filter(floor => floor.companies.length > 0);
  const general = sections.filter(section => section.brand === null);
  return general.length
    ? [
        ...groups,
        { floorId: null, floorName: null, companies: [{ brand: null, sections: general }] },
      ]
    : groups;
};

const orderedSections = (groups: IQuotationFloorGroup[]): IQuotationSection[] =>
  groups.flatMap(group => group.companies.flatMap(company => company.sections));

export const withoutQuotationSection = (quotation: IQuotation, id: string): IQuotationSection[] =>
  orderedSections(quotationFloorGroups(quotation)).filter(section => section.id !== id);

export const quotationSectionHeading = (section: IQuotationSection): string => {
  if (section.brand === null) {
    return section.title.trim() === QUOTATION_ROW_COPY.GENERAL ? "" : section.title.trim();
  }
  return section.title.trim() || QUOTATION_SYSTEM_LABELS[section.systemType];
};

export const renameQuotationFloor = (
  quotation: IQuotation,
  floor: IQuotationFloor,
): IQuotation => ({
  ...quotation,
  sections: quotation.sections.map(section =>
    section.floorId === floor.floorId ? { ...section, floorName: floor.floorName } : section,
  ),
});

export const moveQuotationFloor = (
  quotation: IQuotation,
  floorId: string,
  direction: number,
): IQuotation => {
  const groups = quotationFloorGroups(quotation);
  const index = groups.findIndex(group => group.floorId === floorId);
  const target = index + direction;
  if (index < 0 || !groups[target]?.floorId) {
    return quotation;
  }
  [groups[index], groups[target]] = [groups[target], groups[index]];
  return {
    ...quotation,
    sections: orderedSections(groups),
  };
};

export const assignSectionFloor = (
  quotation: IQuotation,
  section: IQuotationSection,
): IQuotation => {
  const previous = quotation.sections.find(current => current.id === section.id);
  if ((previous?.floorId ?? null) === (section.floorId ?? null)) {
    return {
      ...quotation,
      sections: quotation.sections.map(current => (current.id === section.id ? section : current)),
    };
  }
  const sections = withoutQuotationSection(quotation, section.id);
  return { ...quotation, sections: [...sections, section] };
};
