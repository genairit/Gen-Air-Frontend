import {
  PROJECT_CONSTRAINTS,
  PROJECT_CONSTRAINT_COPY,
} from "../constants/project-constraints.constant";

import { isAxiosError } from "axios";
import { isRecord } from "./guards/primitive.guard";
import type { IProjectFormValues } from "../interfaces/project.interface";
import type { IValidationResult } from "../interfaces/validation-result.interface";
import type { IProjectNameCheckState } from "../interfaces/project-constraints.interface";

export const getLightingHeightError = (values: IProjectFormValues): string => {
  if (!values.hasGeneralLightingCeilingLowering) {
    return "";
  }

  const height = values.generalLightingCeilingLoweringHeight.trim();
  if (!height) {
    return PROJECT_CONSTRAINT_COPY.HEIGHT_REQUIRED;
  }

  const hasValidFormat = PROJECT_CONSTRAINTS.HEIGHT_PATTERN.test(height);
  const isFiniteHeight = Number.isFinite(Number(height));
  return hasValidFormat && isFiniteHeight ? "" : PROJECT_CONSTRAINT_COPY.HEIGHT_INVALID;
};

export const toLightingPayload = (values: IProjectFormValues) => {
  const isValidHeight = getLightingHeightError(values) === "";
  const shouldPersistHeight = values.hasGeneralLightingCeilingLowering && isValidHeight;

  return {
    hasGeneralLightingCeilingLowering: values.hasGeneralLightingCeilingLowering,
    generalLightingCeilingLoweringHeight: shouldPersistHeight
      ? Number(values.generalLightingCeilingLoweringHeight.trim())
      : null,
  };
};

export const validateConstraintField = (errorText: string): IValidationResult => ({
  errorText,
  isValid: !errorText,
});

export const isProjectNameConflict = (error: unknown): boolean => {
  if (!isAxiosError(error)) {
    return false;
  }

  const body: unknown = error.response?.data;
  return isRecord(body) && body.code === PROJECT_CONSTRAINTS.NAME_CONFLICT_CODE;
};

export const getProjectNameError = (state: IProjectNameCheckState): string => {
  if (state.isTaken) {
    return PROJECT_CONSTRAINT_COPY.DUPLICATE_NAME;
  }

  return state.isCheckFailed ? PROJECT_CONSTRAINT_COPY.NAME_CHECK_FAILED : "";
};

export const hasValidProjectLighting = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  const enabled = value.hasGeneralLightingCeilingLowering;
  const height = value.generalLightingCeilingLoweringHeight;
  const hasNoLighting =
    !("hasGeneralLightingCeilingLowering" in value) &&
    !("generalLightingCeilingLoweringHeight" in value);
  if (hasNoLighting) {
    return true;
  }

  if (typeof enabled !== "boolean") {
    return false;
  }

  const isValidHeight = typeof height === "number" && Number.isFinite(height) && height >= 0;
  return enabled ? isValidHeight : height === null;
};
