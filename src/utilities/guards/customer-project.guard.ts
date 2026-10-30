import {
  isRecord,
  isNumber,
  isArrayOf,
  hasStringFields,
  isNullableString,
} from "./primitive.guard";

import {
  CUSTOMER_PROJECT_KINDS,
  type CustomerProjectKindType,
} from "../../constants/customer-project.constant";

import type {
  ICustomerProjectItem,
  ICustomerProjectPage,
  ICustomerProjectBuilding,
} from "../../interfaces/customer-project.interface";

import type { IProjectListMember } from "../../interfaces/project-list.interface";
import { isApiProjectType, isApiProjectStage, isProjectStageCounts } from "./api.guard";

export const isCustomerProjectKind = (value?: unknown): value is CustomerProjectKindType =>
  Object.values(CUSTOMER_PROJECT_KINDS).some(kind => kind === value);

const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

const isMember = (value: unknown): value is IProjectListMember =>
  isRecord(value) &&
  (value.user === null ||
    (isRecord(value.user) && hasStringFields(value.user, ["id", "firstName", "lastName"])));

const isBuilding = (value: unknown): value is ICustomerProjectBuilding =>
  isRecord(value) && hasStringFields(value, ["id", "name", "code"]);

export const isCustomerProjectItem = (value: unknown): value is ICustomerProjectItem => {
  if (!isRecord(value)) {
    return false;
  }

  const hasIdentity = hasStringFields(value, ["id", "name", "code", "stageId", "updatedAt"]);
  const hasType = value.projectType === null || isApiProjectType(value.projectType);
  const hasStage = value.stage === null || isApiProjectStage(value.stage);
  const hasBuilding = value.building === null || isBuilding(value.building);
  const hasFloor = value.customerFloor === null || isNumber(value.customerFloor);
  const hasHierarchy = isNullableString(value.parentProjectId) && hasBuilding && hasFloor;
  const hasMembers = isArrayOf(isMember)(value.members);

  return (
    hasIdentity &&
    hasType &&
    hasStage &&
    hasHierarchy &&
    hasMembers &&
    isCustomerProjectKind(value.kind) &&
    isCount(value.apartmentCount)
  );
};

export const isCustomerProjectPage = (value: unknown): value is ICustomerProjectPage =>
  isRecord(value) &&
  isArrayOf(isCustomerProjectItem)(value.items) &&
  isNullableString(value.nextCursor) &&
  isCount(value.total) &&
  isProjectStageCounts(value.counts);
