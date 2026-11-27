import {
  EQUIPMENT_ROLE,
  QUOTATION_SYSTEM,
  QUOTATION_SYSTEM_LABELS,
} from "../../constants/quotation.constant";

import type {
  TCatalogueForm,
  TCatalogueErrors,
  TCatalogueItemChanges,
} from "../../interfaces/catalogue.interface";

import type { ICatalogueItem } from "../../interfaces/quotation.interface";

export const CATALOGUE_FORM_FIELDS = [
  { name: "description", label: "תיאור", maxLength: 1000, required: true },
  { name: "sku", label: "מק״ט", maxLength: 200, required: true },
  { name: "unit", label: "יחידת מידה", maxLength: 40, required: true },
  { name: "price", label: "מחיר ליחידה (₪)", maxLength: 17, required: true },
  { name: "capacityBtu", label: "תפוקה (BTU)", maxLength: 9, required: false },
] as const;

export const EQUIPMENT_ROLE_OPTIONS = [
  { value: EQUIPMENT_ROLE.OTHER, label: "אחר" },
  { value: EQUIPMENT_ROLE.INDOOR, label: "יחידת פנים" },
  { value: EQUIPMENT_ROLE.OUTDOOR, label: "יחידת חוץ" },
  { value: EQUIPMENT_ROLE.UNIT, label: "מערכת עצמאית" },
  { value: EQUIPMENT_ROLE.CONTROL, label: "בקר או שלט" },
  { value: EQUIPMENT_ROLE.CENTRAL, label: "בקרה מרכזית" },
  { value: EQUIPMENT_ROLE.HEADER, label: "מפצל" },
  { value: EQUIPMENT_ROLE.PIPE, label: "צנרת" },
];
export const SYSTEM_OPTIONS = [
  { value: "", label: "ללא שיוך" },
  ...Object.values(QUOTATION_SYSTEM).map(value => ({
    value,
    label: QUOTATION_SYSTEM_LABELS[value],
  })),
];

export const createCatalogueForm = (item?: ICatalogueItem): TCatalogueForm => ({
  sku: item?.sku ?? "",
  unit: item?.unit ?? "",
  brand: item?.brand ?? "",
  price: item?.price ?? "",
  systemType: item?.systemType ?? null,
  description: item?.description ?? "",
  capacityBtu: item?.capacityBtu?.toString() ?? "",
  equipmentRole: item?.equipmentRole ?? EQUIPMENT_ROLE.OTHER,
  includesRemote: item?.includesRemote ?? false,
  includesThermostat: item?.includesThermostat ?? false,
});

export const validateCatalogueForm = (
  form: TCatalogueForm,
  original?: TCatalogueForm,
): TCatalogueErrors => {
  const errors: TCatalogueErrors = {};
  for (const field of CATALOGUE_FORM_FIELDS) {
    if (field.required && form[field.name] !== original?.[field.name] && !form[field.name].trim()) {
      errors[field.name] = "יש למלא את השדה";
    }
  }
  if (form.price.trim() && !/^\d{1,12}(?:\.\d{1,4})?$/.test(form.price.trim())) {
    errors.price = "יש להזין מחיר של 0 ומעלה, עם עד 4 ספרות אחרי הנקודה";
  }

  const capacity = form.capacityBtu.trim();
  if (
    capacity &&
    capacity !== original?.capacityBtu &&
    (!/^\d+$/.test(capacity) || Number(capacity) < 1 || Number(capacity) > 100000000)
  ) {
    errors.capacityBtu = "יש להזין תפוקה במספר שלם בין 1 ל־100,000,000";
  }
  return errors;
};

export const toCatalogueChanges = (form: TCatalogueForm): TCatalogueItemChanges => ({
  unit: form.unit.trim(),
  price: form.price.trim(),
  capacityBtu: form.capacityBtu.trim() ? Number(form.capacityBtu) : null,
  description: form.description.trim(),
  equipmentRole: form.equipmentRole,
  includesRemote: form.includesRemote,
  includesThermostat: form.includesThermostat,
});

export const changedCatalogueFields = (
  form: TCatalogueForm,
  original: TCatalogueForm,
): Partial<TCatalogueItemChanges> => {
  const payload = toCatalogueChanges(form);
  const previous = toCatalogueChanges(original);
  const fields = Object.keys(payload) as (keyof TCatalogueItemChanges)[];
  return Object.fromEntries(
    fields
      .filter(field => payload[field] !== previous[field])
      .map(field => [field, payload[field]]),
  );
};
