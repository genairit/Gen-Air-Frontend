import {
  ESTIMATE_IMAGE_TYPES,
  ESTIMATE_SCOPE_LABELS,
  ESTIMATE_MAX_PLAN_BYTES,
  ESTIMATE_MAX_MARKED_BYTES,
  ESTIMATE_EQUIPMENT_LABELS,
  ESTIMATE_DISTRIBUTION_LABELS,
  ESTIMATE_PLAN_TYPE_BY_EXTENSION,
} from "../constants/engineering-estimate.constant";

import type {
  EstimateScopeType,
  EstimateEquipmentType,
  IEstimateMeasurements,
  EstimateDistributionType,
} from "../interfaces/engineering-estimate.interface";

export const isEstimateScope = (value: string): value is EstimateScopeType =>
  Object.hasOwn(ESTIMATE_SCOPE_LABELS, value);

export const isEstimateEquipment = (value: string): value is EstimateEquipmentType =>
  Object.hasOwn(ESTIMATE_EQUIPMENT_LABELS, value);

export const isEstimateDistribution = (value: string): value is EstimateDistributionType =>
  Object.hasOwn(ESTIMATE_DISTRIBUTION_LABELS, value);

export const isValidEstimateQuantity = (value: string): boolean => {
  const parsed = Number(value);
  const isDecimal = /^\d{1,6}(\.\d{1,4})?$/.test(value);
  return isDecimal && Number.isFinite(parsed) && parsed > 0;
};

export const initialEstimateMeasurements = (): IEstimateMeasurements => ({
  equipment: "other",
  shelterSupply: false,
  pipeMetresIncludingRise: 0,
  distribution: { kind: "none" },
});

export const validEstimateMeasurements = (measurements: IEstimateMeasurements): boolean => {
  const validPipe =
    Number.isFinite(measurements.pipeMetresIncludingRise) &&
    measurements.pipeMetresIncludingRise >= 0;
  const { distribution } = measurements;
  if (distribution.kind !== "duct") {
    return validPipe;
  }

  const { metres, bends, catalogueCode } = distribution;
  const codePresent = Boolean(catalogueCode?.trim());
  const validMetres = typeof metres === "number" && Number.isFinite(metres) && metres > 0;
  const validBends = typeof bends === "number" && Number.isSafeInteger(bends) && bends >= 0;
  return validPipe && codePresent && validMetres && validBends;
};

export const validEstimateRepeatCount = (value: number): boolean =>
  Number.isSafeInteger(value) && value >= 1 && value <= 10000;

export const estimatePlanType = (file: Pick<File, "name" | "type">): string | null => {
  const extension = /\.([a-z]+)$/iu.exec(file.name)?.[1]?.toLowerCase() ?? "";
  const mime =
    Object.entries(ESTIMATE_PLAN_TYPE_BY_EXTENSION).find(([key]) => key === extension)?.[1] ?? null;
  const matches = file.type === "" || file.type === mime;
  return matches ? mime : null;
};

export const validateEstimatePlanSelection = (file: File, marked: boolean): string | null => {
  const mime = estimatePlanType(file);
  const typeAllowed = mime !== null && (!marked || ESTIMATE_IMAGE_TYPES.includes(mime));
  if (!typeAllowed) {
    return marked
      ? "תשריט מסומן חייב להיות PNG או JPEG."
      : "יש לבחור תוכנית בפורמט PDF, PNG או JPEG.";
  }

  const max = marked ? ESTIMATE_MAX_MARKED_BYTES : ESTIMATE_MAX_PLAN_BYTES;
  if (file.size <= 0 || file.size > max) {
    return marked
      ? "תשריט מסומן יכול להיות עד 512KB ואינו יכול להיות ריק."
      : "תוכנית יכולה להיות עד 4MB ואינה יכולה להיות ריקה.";
  }

  return null;
};
