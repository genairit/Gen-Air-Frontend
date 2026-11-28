import {
  isValidEstimateQuantity,
  validEstimateRepeatCount,
  validEstimateMeasurements,
} from "./engineering-estimate.utility";

import type {
  IEstimateArea,
  IEstimateInputLine,
  IEngineeringEstimate,
} from "../interfaces/engineering-estimate.interface";

import { CommandIdentityManager } from "../managers/command-identity.manager";

export const newEstimateLine = (): IEstimateInputLine => ({
  id: CommandIdentityManager.create(),
  catalogueItemId: "",
  quantity: "1",
});

export const validEstimateLine = (line: IEstimateInputLine): boolean =>
  Boolean(line.catalogueItemId) &&
  isValidEstimateQuantity(line.quantity) &&
  (!line.measurements || validEstimateMeasurements(line.measurements));

export const validEstimateDraft = (areas: IEstimateArea[]): boolean =>
  areas.every(
    area =>
      Boolean(area.name.trim()) &&
      validEstimateRepeatCount(area.repeatCount) &&
      area.lines.every(validEstimateLine),
  );

export const emptyEstimateDraft = (): IEngineeringEstimate => ({
  id: "",
  name: "",
  version: 0,
  subtotal: "0",
  plans: [],
  areas: [],
  scope: "hvac",
  projectId: null,
  status: "draft",
  quotationId: null,
  setupStep: "project",
  lines: [],
  quotationUnavailable: false,
  questions: [],
  approvedVersion: null,
  quotationCustomerId: null,
});
