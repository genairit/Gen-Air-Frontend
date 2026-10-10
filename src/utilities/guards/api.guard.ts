import {
  isRecord,
  isNumber,
  isArrayOf,
  isOptionalOf,
  hasStringFields,
  isNullableString,
} from "./primitive.guard";

import type {
  IApiUser,
  ICursorPage,
  IApiProject,
  IApiDriveItem,
  ILoginResponse,
  TUserRoleCounts,
  IApiProjectType,
  IApiProjectStage,
  IApiProjectMember,
  IApiDriveContents,
  IProjectStageCounts,
  IApiStageTransition,
  IApiTemplateFolderNode,
} from "../../interfaces/api.interface";

import { USER_ROLE_VALUES, type UserRoleType } from "../../constants/user-role.constant";

export const isUserRole = (value?: unknown): value is UserRoleType =>
  USER_ROLE_VALUES.some(role => role === value);

export const isApiUser = (value: unknown): value is IApiUser => {
  if (!isRecord(value)) {
    return false;
  }

  const hasIdentity = hasStringFields(value, ["id", "email", "firstName", "lastName"]);
  const hasContact = hasStringFields(value, ["phone", "employeeNumber"]);

  return hasIdentity && hasContact && isUserRole(value.role);
};

export const isApiProjectStage = (value: unknown): value is IApiProjectStage => {
  if (!isRecord(value)) {
    return false;
  }

  return hasStringFields(value, ["id", "name"]) && isNumber(value.position);
};

export const isApiProjectType = (value: unknown): value is IApiProjectType => {
  if (!isRecord(value)) {
    return false;
  }

  return hasStringFields(value, ["id", "name"]) && isNullableString(value.icon);
};

const isApiProjectMember = (value: unknown): value is IApiProjectMember => {
  if (!isRecord(value)) {
    return false;
  }

  const hasIds = hasStringFields(value, ["id", "userId"]);

  return hasIds && isUserRole(value.role) && isOptionalOf(isApiUser)(value.user);
};

export const isApiProject = (value: unknown): value is IApiProject => {
  if (!isRecord(value)) {
    return false;
  }

  const hasIdentity = hasStringFields(value, ["id", "code", "name"]);
  const hasRelations = hasStringFields(value, ["stageId", "projectTypeId", "updatedAt"]);
  const hasValidMembers = isOptionalOf(isArrayOf(isApiProjectMember))(value.members);

  return hasIdentity && hasRelations && hasValidMembers;
};

export const isCursorPageOf =
  <TItem>(isItem: (value: unknown) => value is TItem) =>
  (value: unknown): value is ICursorPage<TItem> =>
    isRecord(value) && isArrayOf(isItem)(value.items) && isNullableString(value.nextCursor);

export const isLoginResponse = (value: unknown): value is ILoginResponse =>
  isRecord(value) && typeof value.accessToken === "string" && isApiUser(value.user);

const isNumberRecord = (value: unknown): value is Record<string, number> =>
  isRecord(value) && Object.values(value).every(isNumber);

export const isProjectStageCounts = (value: unknown): value is IProjectStageCounts =>
  isRecord(value) && isNumber(value.total) && isNumberRecord(value.byStage);

export const isUserRoleCounts = (value: unknown): value is TUserRoleCounts =>
  isNumberRecord(value) && USER_ROLE_VALUES.every(role => isNumber(value[role]));

export const isApiStageTransition = (value: unknown): value is IApiStageTransition => {
  if (!isRecord(value)) {
    return false;
  }

  const hasFields = hasStringFields(value, ["id", "createdAt", "toStageId"]);

  return hasFields && isOptionalOf(isApiUser)(value.changedBy);
};

const isApiDriveItem = (value: unknown): value is IApiDriveItem =>
  isRecord(value) && hasStringFields(value, ["id", "name", "mimeType"]);

const isApiDriveFolder = (value: unknown) =>
  isRecord(value) && hasStringFields(value, ["id", "name"]) && isNumber(value.fileCount);

export const isApiDriveContents = (value: unknown): value is IApiDriveContents => {
  if (!isRecord(value)) {
    return false;
  }

  const hasFiles = isArrayOf(isApiDriveItem)(value.files);
  const hasFolders = Array.isArray(value.folders) && value.folders.every(isApiDriveFolder);

  return typeof value.folderId === "string" && hasFiles && hasFolders;
};

export const isApiTemplateFolderNode = (value: unknown): value is IApiTemplateFolderNode => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasStringFields(value, ["id", "name"]) && isArrayOf(isApiTemplateFolderNode)(value.children)
  );
};
