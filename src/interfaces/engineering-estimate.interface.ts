import type {
  ESTIMATE_SETUP,
  ESTIMATE_SCOPE_LABELS,
  ESTIMATE_STATUS_LABELS,
  ESTIMATE_EQUIPMENT_LABELS,
  ESTIMATE_DISTRIBUTION_LABELS,
} from "../constants/engineering-estimate.constant";

export type EstimateScopeType = keyof typeof ESTIMATE_SCOPE_LABELS;
export type EstimateStatusType = keyof typeof ESTIMATE_STATUS_LABELS;
export type EstimateSetupType = (typeof ESTIMATE_SETUP)[keyof typeof ESTIMATE_SETUP];

export type EstimateEquipmentType = keyof typeof ESTIMATE_EQUIPMENT_LABELS;
export type EstimateDistributionType = keyof typeof ESTIMATE_DISTRIBUTION_LABELS;

export interface IEstimateDistribution {
  bends?: number;
  metres?: number;
  catalogueCode?: string;
  kind: EstimateDistributionType;
}

export interface IEstimateMeasurements {
  shelterSupply: boolean;
  pipeMetresIncludingRise: number;
  equipment: EstimateEquipmentType;
  distribution: IEstimateDistribution;
}

export interface IEstimateInputLine {
  id: string;
  source?: string;
  quantity: string;
  catalogueItemId: string;
  measurements?: IEstimateMeasurements;
}

export interface IEstimateArea {
  id: string;
  name: string;
  repeatCount: number;
  lines: IEstimateInputLine[];
}

export interface IEstimatePlan {
  id: string;
  name: string;
  marked: boolean;
  mimeType: string;
}

export interface IEstimateQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: string | null;
}

export interface IEstimatePricedLine {
  sku: string;
  unit: string;
  areaId: string;
  areaName: string;
  quantity: string;
  description: string;
  total: string | null;
  unitPrice: string | null;
  source: "manual" | "rule";
  provenance: string | null;
  catalogueItemId: string | null;
}

export interface IEngineeringEstimate {
  id: string;
  name: string;
  version: number;
  subtotal: string;
  plans: IEstimatePlan[];
  areas: IEstimateArea[];
  scope: EstimateScopeType;
  projectId: string | null;
  status: EstimateStatusType;
  quotationId: string | null;
  setupStep: EstimateSetupType;
  lines: IEstimatePricedLine[];
  questions: IEstimateQuestion[];
  approvedVersion: number | null;
}

export interface IEstimateSample {
  areaId: string;
  planId: string;
}

export interface IEstimateCreate {
  name: string;
  projectId?: string | null;
}

export type TEstimatePatch = Pick<IEngineeringEstimate, "version"> &
  Partial<
    Pick<IEngineeringEstimate, "name" | "projectId" | "scope" | "areas" | "questions" | "setupStep">
  >;
