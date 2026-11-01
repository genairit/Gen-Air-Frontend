import { logger } from "./logger.utility";
import { isRecord } from "./guards/primitive.guard";
import { isPaymentTerms } from "./guards/api.guard";
import { toProjectFormValues } from "./project.utility";
import { mapProjectMemberRoles } from "./user-role.utility";
import { LOCAL_STORAGE_KEYS } from "../constants/storage.constant";
import { LocalStorageManager } from "../managers/web-storage.manager";
import { PROJECT_MEMBER_ROLES } from "../constants/user-role.constant";
import type { IProjectFormValues } from "../interfaces/project.interface";

// Version 2 replaced the system_admin/lead_installer slots with the four project member roles.
const PROJECT_DRAFT_VERSION = 2;

const draftKey = (userId: string) => `${LOCAL_STORAGE_KEYS.PROJECT_FORM_DRAFT}:${userId}` as const;

// Allowlist only: never store session, customer, contact, address or payment-note data.
const toStoredValues = (values: IProjectFormValues) => ({
  name: values.name,
  hasGeneralLightingCeilingLowering: values.hasGeneralLightingCeilingLowering,
  generalLightingCeilingLoweringHeight: values.generalLightingCeilingLoweringHeight,
  typeId: values.typeId,
  stageId: values.stageId,
  assignees: Object.fromEntries(PROJECT_MEMBER_ROLES.map(role => [role, values.assignees[role]])),
  terms: values.paymentTerms.terms,
});

type TStoredProjectValues = Partial<ReturnType<typeof toStoredValues>>;

interface IStoredProjectDraft {
  version?: number;
  values?: TStoredProjectValues;
}

export const clearProjectDraft = (userId: string | null) => {
  if (!userId) {
    return;
  }

  LocalStorageManager.removeItem(draftKey(userId));
};

export const saveProjectDraft = (userId: string | null, values: IProjectFormValues) => {
  if (!userId) {
    return;
  }

  const stored = toStoredValues(values);
  const isEmptyDraft =
    JSON.stringify(stored) === JSON.stringify(toStoredValues(toProjectFormValues(null)));

  if (isEmptyDraft) {
    clearProjectDraft(userId);
    return;
  }

  LocalStorageManager.setItem(
    draftKey(userId),
    JSON.stringify({ version: PROJECT_DRAFT_VERSION, values: stored }),
  );
};

const isNullableString = (value: unknown) => value === null || typeof value === "string";

const isRestorableDraftValues = (values: TStoredProjectValues) => {
  const hasValidName = typeof values.name === "string";
  const hasValidReferences = isNullableString(values.typeId) && isNullableString(values.stageId);
  const hasValidAssignees = PROJECT_MEMBER_ROLES.every(role =>
    isNullableString(values.assignees?.[role]),
  );
  const hasValidTerms = values.terms === null || isPaymentTerms(values.terms);

  const hasValidLighting =
    (!("hasGeneralLightingCeilingLowering" in values) ||
      typeof values.hasGeneralLightingCeilingLowering === "boolean") &&
    (!("generalLightingCeilingLoweringHeight" in values) ||
      typeof values.generalLightingCeilingLoweringHeight === "string");
  return (
    hasValidName && hasValidReferences && hasValidAssignees && hasValidTerms && hasValidLighting
  );
};

const isStoredProjectDraft = (value: unknown): value is IStoredProjectDraft => {
  if (!isRecord(value)) {
    return false;
  }

  const hasValues = !("values" in value) || isRecord(value.values);
  const hasVersion = !("version" in value) || typeof value.version === "number";

  return hasValues && hasVersion;
};

const toRestorableDraftValues = (draft: IStoredProjectDraft) => {
  const isCurrentVersion = draft.version === PROJECT_DRAFT_VERSION;
  const values = draft.values ?? null;

  if (!isCurrentVersion || !values || !isRestorableDraftValues(values)) {
    return null;
  }

  return values;
};

const restoreProjectFormValues = (values: TStoredProjectValues): IProjectFormValues => {
  const emptyValues = toProjectFormValues(null);

  return {
    ...emptyValues,
    name: values.name ?? "",
    hasGeneralLightingCeilingLowering: values.hasGeneralLightingCeilingLowering ?? false,
    generalLightingCeilingLoweringHeight: values.generalLightingCeilingLoweringHeight ?? "",
    typeId: values.typeId ?? null,
    stageId: values.stageId ?? null,
    assignees: mapProjectMemberRoles(role => values.assignees?.[role] ?? null),
    paymentTerms: { ...emptyValues.paymentTerms, terms: values.terms ?? null },
  };
};

export const readProjectDraft = (userId: string | null): IProjectFormValues | null => {
  if (!userId) {
    return null;
  }

  try {
    const raw = LocalStorageManager.getItem(draftKey(userId));

    if (!raw) {
      return null;
    }

    const parsedDraft: unknown = JSON.parse(raw);
    const values = isStoredProjectDraft(parsedDraft) ? toRestorableDraftValues(parsedDraft) : null;

    if (!values) {
      return null;
    }

    return restoreProjectFormValues(values);
  } catch (error) {
    logger.warn("Discarded an unreadable project form draft", { error });
    return null;
  }
};
