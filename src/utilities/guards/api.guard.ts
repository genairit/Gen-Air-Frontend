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
  IApiCustomer,
  IApiDriveItem,
  ILoginResponse,
  IApiDriveFolder,
  TUserRoleCounts,
  IApiProjectType,
  IApiProjectStage,
  IApiPlaceAddress,
  IApiApartmentPage,
  IApiProjectMember,
  IApiDriveContents,
  IApiSharedDocument,
  IApiAuthorizedUser,
  IApiPlaceSuggestion,
  IProjectStageCounts,
  IApiStageTransition,
  TCustomerSyncStatusCounts,
} from "../../interfaces/api.interface";

import {
  type FolderContentStatusType,
  FOLDER_CONTENT_STATUS_VALUES,
} from "../../constants/drive-folder.constant";

import {
  PAYMENT_TERMS_VALUES,
  type PaymentTermsType,
} from "../../constants/payment-terms.constant";

import {
  type PrioritySyncStatusType,
  PRIORITY_SYNC_STATUS_VALUES,
} from "../../constants/priority-sync.constant";

import {
  type ProjectDetailFieldSetType,
  PROJECT_DETAIL_FIELD_SET_VALUES,
} from "../../constants/project-detail-field-set.constant";

import { isPermission } from "./permission.guard";
import { isCustomerContactList } from "../customer-contact.utility";
import { hasValidProjectLighting } from "../project-constraints.utility";
import { SHARED_DOCUMENT_STATUS } from "../../constants/shared-document.constant";
import { USER_ROLE_VALUES, type UserRoleType } from "../../constants/user-role.constant";
import { isApartmentCredit, isApartmentOwnership } from "../apartment-commercial.utility";

export const isUserRole = (value?: unknown): value is UserRoleType =>
  USER_ROLE_VALUES.some(role => role === value);

const isAssignedRoles = (value: unknown): value is UserRoleType[] => {
  const isNonEmpty = Array.isArray(value) && value.length > 0;
  const hasUniqueRoles = isNonEmpty && new Set(value).size === value.length;

  return isNonEmpty && hasUniqueRoles && isArrayOf(isUserRole)(value);
};

export const isApiUser = (value: unknown): value is IApiUser => {
  if (!isRecord(value)) {
    return false;
  }

  const hasIdentity = hasStringFields(value, ["id", "email", "firstName", "lastName"]);
  const hasContact = hasStringFields(value, ["phone", "employeeNumber"]);
  const activeRole = isUserRole(value.role) ? value.role : null;
  const hasRole = activeRole !== null;
  const hasValidAssignedRoles =
    !("assignedRoles" in value) ||
    (activeRole !== null &&
      isAssignedRoles(value.assignedRoles) &&
      value.assignedRoles.includes(activeRole));

  return hasIdentity && hasContact && hasRole && hasValidAssignedRoles;
};

export const isAuthorizedUser = (value: unknown): value is IApiAuthorizedUser =>
  isRecord(value) &&
  isApiUser(value) &&
  isAssignedRoles(value.assignedRoles) &&
  value.assignedRoles.includes(value.role) &&
  isArrayOf(isPermission)(value.permissions);

export const isDetailFieldSet = (value?: unknown): value is ProjectDetailFieldSetType =>
  PROJECT_DETAIL_FIELD_SET_VALUES.some(fieldSet => fieldSet === value);

const CUSTOMER_TEXT_FIELDS = [
  "customerName",
  "customerCity",
  "customerUnit",
  "customerPhone",
  "customerEmail",
  "customerAddress",
  "customerApartment",
  "customerCompanyNumber",
  "customerAssociationNumber",
] as const;

const hasCustomerDetails = (value: Record<string, unknown>) => {
  const hasTextFields = CUSTOMER_TEXT_FIELDS.every(field => isNullableString(value[field]));
  const hasFloor = value.customerFloor === null || isNumber(value.customerFloor);

  return hasTextFields && hasFloor;
};

const PROJECT_INTAKE_TEXT_FIELDS = [
  "address",
  "contactName",
  "contactRole",
  "addressCity",
  "contactPhone",
  "addressPlaceId",
] as const;

export const isPaymentTerms = (value?: unknown): value is PaymentTermsType =>
  PAYMENT_TERMS_VALUES.some(terms => terms === value);

const hasProjectIntake = (value: Record<string, unknown>) => {
  const hasTextFields = PROJECT_INTAKE_TEXT_FIELDS.every(field => isNullableString(value[field]));
  return hasTextFields;
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

  const hasIdentity = hasStringFields(value, ["id", "name"]);

  const hasApartmentRule = typeof value.canHaveApartments === "boolean";

  return (
    hasIdentity &&
    hasApartmentRule &&
    isNullableString(value.icon) &&
    isDetailFieldSet(value.detailFieldSet)
  );
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

  const hasDetails = hasCustomerDetails(value) && hasProjectIntake(value);
  const hasHierarchy = isNullableString(value.parentProjectId) && isNullableString(value.notes);
  const hasSharedDocument =
    !("sharedDocumentFileId" in value) || isNullableString(value.sharedDocumentFileId);
  const hasValidCredit = isOptionalOf(isApartmentCredit)(value.apartmentCredit);
  const hasValidOwnership = isOptionalOf(isApartmentOwnership)(value.apartmentOwnership);
  const hasValidOwnTeam = !("hasOwnTeam" in value) || typeof value.hasOwnTeam === "boolean";
  const hasValidCustomer =
    isNullableString(value.customerId) && isOptionalOf(isApiCustomer)(value.customer);

  return (
    hasIdentity &&
    hasRelations &&
    hasValidMembers &&
    hasDetails &&
    hasHierarchy &&
    hasSharedDocument &&
    hasValidCustomer &&
    hasValidOwnTeam &&
    hasValidCredit &&
    hasValidOwnership &&
    hasValidProjectLighting(value)
  );
};

export const isCursorPageOf =
  <TItem>(isItem: (value: unknown) => value is TItem) =>
  (value: unknown): value is ICursorPage<TItem> =>
    isRecord(value) && isArrayOf(isItem)(value.items) && isNullableString(value.nextCursor);

export const isLoginResponse = (value: unknown): value is ILoginResponse =>
  isRecord(value) && typeof value.accessToken === "string" && isAuthorizedUser(value.user);

const isNumberRecord = (value: unknown): value is Record<string, number> =>
  isRecord(value) && Object.values(value).every(isNumber);

export const isProjectStageCounts = (value: unknown): value is IProjectStageCounts =>
  isRecord(value) && isNumber(value.total) && isNumberRecord(value.byStage);

export const isUserRoleCounts = (value: unknown): value is TUserRoleCounts =>
  isNumberRecord(value) &&
  isNumber(value.total) &&
  USER_ROLE_VALUES.every(role => isNumber(value[role]));

export const isApiStageTransition = (value: unknown): value is IApiStageTransition => {
  if (!isRecord(value)) {
    return false;
  }

  const hasFields = hasStringFields(value, ["id", "createdAt", "toStageId"]);

  return hasFields && isOptionalOf(isApiUser)(value.changedBy);
};

const isApiDriveItem = (value: unknown): value is IApiDriveItem =>
  isRecord(value) && hasStringFields(value, ["id", "name", "mimeType"]);

const isFolderContentStatus = (value?: unknown): value is FolderContentStatusType =>
  FOLDER_CONTENT_STATUS_VALUES.some(status => status === value);

const isApiDriveFolder = (value: unknown): value is IApiDriveFolder => {
  if (!isRecord(value)) {
    return false;
  }

  const hasIdentity = hasStringFields(value, ["id", "name"]);
  const hasFileCount = value.fileCount === null || isNumber(value.fileCount);

  return hasIdentity && hasFileCount && isFolderContentStatus(value.contentStatus);
};

export const isApiDriveContents = (value: unknown): value is IApiDriveContents => {
  if (!isRecord(value)) {
    return false;
  }

  const hasFiles = isArrayOf(isApiDriveItem)(value.files);
  const hasFolders = isArrayOf(isApiDriveFolder)(value.folders);

  return typeof value.folderId === "string" && hasFiles && hasFolders;
};

export const isApiSharedDocument = (value: unknown): value is IApiSharedDocument => {
  if (
    !isRecord(value) ||
    typeof value.status !== "string" ||
    !Object.values(SHARED_DOCUMENT_STATUS).some(status => status === value.status)
  ) {
    return false;
  }
  if (value.status !== SHARED_DOCUMENT_STATUS.AVAILABLE) {
    return value.file === null;
  }
  if (
    !isRecord(value.file) ||
    !hasStringFields(value.file, ["id", "name", "url"]) ||
    typeof value.file.url !== "string"
  ) {
    return false;
  }
  try {
    const url = new URL(value.file.url);
    return url.protocol === "https:" && url.hostname === "drive.google.com";
  } catch {
    return false;
  }
};

export const isApiPlaceSuggestion = (value: unknown): value is IApiPlaceSuggestion => {
  if (!isRecord(value)) {
    return false;
  }

  return hasStringFields(value, ["placeId", "mainText"]) && isNullableString(value.secondaryText);
};

export const isApiPlaceAddress = (value: unknown): value is IApiPlaceAddress => {
  if (!isRecord(value)) {
    return false;
  }

  const hasIdentity = hasStringFields(value, ["placeId", "formattedAddress"]);

  return hasIdentity && isNullableString(value.city) && isNullableString(value.countryCode);
};

export const isPrioritySyncStatus = (value?: unknown): value is PrioritySyncStatusType =>
  PRIORITY_SYNC_STATUS_VALUES.some(status => status === value);

const CUSTOMER_REQUIRED_TEXT_FIELDS = [
  "id",
  "name",
  "phone",
  "email",
  "taxId",
  "address",
  "createdAt",
  "contactName",
] as const;

const CUSTOMER_NULLABLE_TEXT_FIELDS = [
  "priorityId",
  "prioritySyncedAt",
  "prioritySyncError",
] as const;

export const isApiCustomer = (value: unknown): value is IApiCustomer => {
  if (!isRecord(value)) {
    return false;
  }

  const hasIdentity = hasStringFields(value, CUSTOMER_REQUIRED_TEXT_FIELDS);
  const hasType = isDetailFieldSet(value.customerType);
  const hasSyncStatus = isPrioritySyncStatus(value.prioritySyncStatus);
  const hasSyncAttempts = isNumber(value.prioritySyncAttempts);
  const hasSyncDetails = CUSTOMER_NULLABLE_TEXT_FIELDS.every(field =>
    isNullableString(value[field]),
  );
  const hasValidCreator = isOptionalOf(isApiUser)(value.createdBy);
  const hasPaymentDefault =
    !("paymentTerms" in value) || value.paymentTerms === null || isPaymentTerms(value.paymentTerms);
  const hasValidContacts = isOptionalOf(isCustomerContactList)(value.contacts);

  return (
    hasIdentity &&
    hasType &&
    hasSyncStatus &&
    hasSyncAttempts &&
    hasSyncDetails &&
    hasValidCreator &&
    hasPaymentDefault &&
    hasValidContacts
  );
};

export const isCustomerSyncStatusCounts = (value: unknown): value is TCustomerSyncStatusCounts =>
  isNumberRecord(value) && PRIORITY_SYNC_STATUS_VALUES.every(status => isNumber(value[status]));

export const isApiApartmentPage = (value: unknown): value is IApiApartmentPage =>
  isCursorPageOf(isApiProject)(value) && isRecord(value) && isNumber(value.total);
