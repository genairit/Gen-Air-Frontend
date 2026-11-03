import {
  CONTROL_KIND,
  EQUIPMENT_ROLE,
  QUOTATION_EQUIPMENT_ROLES,
} from "../constants/quotation.constant";

import type {
  IQuotation,
  IQuotationLine,
  ICatalogueItem,
  IQuotationSection,
} from "../interfaces/quotation.interface";

import { catalogueLine } from "../utilities/quotation.utility";
import { quotationService } from "../services/quotation.service";
import { AuthorizationContext } from "../managers/authorization-context.manager";

const replacementItem = async (
  line: IQuotationLine,
  section: IQuotationSection,
  brand: string,
): Promise<ICatalogueItem> => {
  const equipment = QUOTATION_EQUIPMENT_ROLES.some(role => role === line.equipmentRole);
  const capacity = line.requestedCapacityBtu ?? line.capacityBtu;
  const candidates = await quotationService.catalogue({
    brand,
    systemType: section.systemType,
    equipmentRole: line.equipmentRole,
    ...(equipment && capacity ? { capacityBtu: capacity } : {}),
    ...(line.equipmentType ? { equipmentType: line.equipmentType } : {}),
  });
  const controlMatch = (item: ICatalogueItem): boolean =>
    line.controlKind === CONTROL_KIND.REMOTE
      ? /^שלט/.test(item.description)
      : !/שלט/.test(item.description);
  const item = equipment ? candidates[0] : candidates.find(controlMatch);
  if (!item) {
    throw new Error(`לא נמצא פריט תואם ל-${line.description}. ההצעה לא שונתה.`);
  }
  return item;
};
const mapLine = async (
  line: IQuotationLine,
  section: IQuotationSection,
  brand: string,
): Promise<IQuotationLine> => {
  const original = await quotationService.catalogueItem(line.catalogueItemId);
  if (!original.brand || original.brand === brand) {
    return line;
  }
  const automatic =
    QUOTATION_EQUIPMENT_ROLES.some(role => role === line.equipmentRole) ||
    line.equipmentRole === EQUIPMENT_ROLE.CONTROL;
  if (!automatic) {
    throw new Error(`נדרשת בחירה מפורשת של פריט חלופי ל-${line.description}. ההצעה לא שונתה.`);
  }
  const item = await replacementItem(line, section, brand);
  const snapshot = catalogueLine(item, line.requestedCapacityBtu);
  return {
    ...snapshot,
    id: line.id,
    quantity: line.quantity,
    location: line.location,
    circuit: line.circuit,
    parentItemId: line.parentItemId,
  };
};
const alreadyIncluded = (line: IQuotationLine, parent: IQuotationLine | null): boolean => {
  if (!parent) {
    return false;
  }
  const remote = parent.includesRemote && line.controlKind === CONTROL_KIND.REMOTE;
  const thermostat = parent.includesThermostat && line.controlKind === CONTROL_KIND.THERMOSTAT;
  return remote || thermostat;
};
const rebrandSection = async (
  section: IQuotationSection,
  brand: string,
): Promise<IQuotationSection> => {
  const replacements = await Promise.all(
    section.items.filter(line => !line.parentItemId).map(line => mapLine(line, section, brand)),
  );
  const children = await Promise.all(
    section.items
      .filter(line => line.parentItemId)
      .map(async line => {
        const parent = replacements.find(candidate => candidate.id === line.parentItemId) ?? null;
        if (alreadyIncluded(line, parent)) {
          return null;
        }
        return mapLine(line, section, brand);
      }),
  );
  const mappedChildren = children.filter((line): line is IQuotationLine => line !== null);
  const byId = new Map([...replacements, ...mappedChildren].map(line => [line.id, line]));
  return {
    ...section,
    items: section.items.flatMap(line => {
      const mapped = byId.get(line.id);
      return mapped ? [mapped] : [];
    }),
  };
};
export const rebrandQuotationAction = async (
  quotation: IQuotation,
  brand: string,
): Promise<IQuotation> => {
  const context = new AuthorizationContext();
  const sections = await Promise.all(
    quotation.sections.map(section => rebrandSection(section, brand)),
  );
  context.assertCurrent();
  return { ...quotation, brand, sections };
};
