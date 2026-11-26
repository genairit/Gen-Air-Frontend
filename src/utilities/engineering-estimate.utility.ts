import {
  ESTIMATE_SCOPE_LABELS,
  ESTIMATE_EQUIPMENT_LABELS,
  ESTIMATE_DISTRIBUTION_LABELS,
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
