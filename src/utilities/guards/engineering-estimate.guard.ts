import {
  isRecord,
  isArrayOf,
  hasStringFields,
  isNullableNumber,
  isNullableString,
} from "./primitive.guard";

import {
  isEstimateScope,
  isEstimateEquipment,
  isEstimateDistribution,
} from "../engineering-estimate.utility";

import {
  ESTIMATE_SETUP,
  ESTIMATE_STATUS_LABELS,
} from "../../constants/engineering-estimate.constant";

import type {
  IEstimateArea,
  IEstimatePlan,
  IEstimateQuestion,
  IEstimateInputLine,
  IEstimatePricedLine,
  IEngineeringEstimate,
  IEstimateDistribution,
  IEstimateMeasurements,
} from "../../interfaces/engineering-estimate.interface";

const isString = (value: unknown): value is string => typeof value === "string";

const isEstimateDistributionRecord = (value: unknown): value is IEstimateDistribution =>
  isRecord(value) &&
  isString(value.kind) &&
  isEstimateDistribution(value.kind) &&
  (value.catalogueCode == null || isString(value.catalogueCode)) &&
  (value.metres == null || typeof value.metres === "number") &&
  (value.bends == null || typeof value.bends === "number");

const isEstimateMeasurements = (value: unknown): value is IEstimateMeasurements =>
  isRecord(value) &&
  isString(value.equipment) &&
  isEstimateEquipment(value.equipment) &&
  typeof value.pipeMetresIncludingRise === "number" &&
  typeof value.shelterSupply === "boolean" &&
  isEstimateDistributionRecord(value.distribution);

const isEstimateLine = (value: unknown): value is IEstimateInputLine =>
  isRecord(value) &&
  hasStringFields(value, ["id", "quantity", "catalogueItemId"]) &&
  (value.source == null || isString(value.source)) &&
  (value.measurements == null || isEstimateMeasurements(value.measurements));

const isEstimateArea = (value: unknown): value is IEstimateArea =>
  isRecord(value) &&
  hasStringFields(value, ["id", "name"]) &&
  typeof value.repeatCount === "number" &&
  isArrayOf(isEstimateLine)(value.lines);

const isEstimatePlan = (value: unknown): value is IEstimatePlan =>
  isRecord(value) &&
  hasStringFields(value, ["id", "name", "mimeType"]) &&
  typeof value.marked === "boolean";

const isEstimateQuestion = (value: unknown): value is IEstimateQuestion =>
  isRecord(value) &&
  hasStringFields(value, ["id", "prompt"]) &&
  isNullableString(value.answer) &&
  isArrayOf(isString)(value.options);

const isEstimatePricedLine = (value: unknown): value is IEstimatePricedLine =>
  isRecord(value) &&
  hasStringFields(value, ["sku", "unit", "areaId", "areaName", "quantity", "description"]) &&
  (value.source === "manual" || value.source === "rule") &&
  isNullableString(value.total) &&
  isNullableString(value.provenance) &&
  isNullableString(value.unitPrice) &&
  isNullableString(value.catalogueItemId);

export const isEngineeringEstimate = (value: unknown): value is IEngineeringEstimate =>
  isRecord(value) &&
  hasStringFields(value, ["id", "name", "subtotal"]) &&
  typeof value.version === "number" &&
  isString(value.setupStep) &&
  Object.values(ESTIMATE_SETUP).some(step => step === value.setupStep) &&
  isString(value.scope) &&
  isEstimateScope(value.scope) &&
  isString(value.status) &&
  Object.hasOwn(ESTIMATE_STATUS_LABELS, value.status) &&
  isNullableString(value.projectId) &&
  isNullableString(value.quotationId) &&
  isNullableNumber(value.approvedVersion) &&
  isArrayOf(isEstimatePlan)(value.plans) &&
  isArrayOf(isEstimateArea)(value.areas) &&
  isArrayOf(isEstimateQuestion)(value.questions) &&
  isArrayOf(isEstimatePricedLine)(value.lines);

export const areEngineeringEstimates = isArrayOf(isEngineeringEstimate);

export const isEstimateQuotation = (value: unknown): value is { quotationId: string } =>
  isRecord(value) && typeof value.quotationId === "string";
