import { toProjectFormValues } from "./project.utility";
import { LOCAL_STORAGE_KEYS } from "../constants/storage.constant";
import { USER_ROLE_VALUES } from "../constants/user-role.constant";
import { LocalStorageManager } from "../managers/web-storage.manager";
import type { IProjectFormValues } from "../interfaces/project.interface";
import { PAYMENT_TERMS_VALUES } from "../constants/payment-terms.constant";

const draftKey = (userId: string) => `${LOCAL_STORAGE_KEYS.PROJECT_FORM_DRAFT}:${userId}` as const;

// Explicit allowlist: never serialize the session, customer/contact details,
// verified address, or free-text payment notes.
const toStoredValues = (values: IProjectFormValues) => ({
  name: values.name,
  typeId: values.typeId,
  stageId: values.stageId,
  assignees: Object.fromEntries(USER_ROLE_VALUES.map(role => [role, values.assignees[role]])),
  terms: values.paymentTerms.terms,
});

export const clearProjectDraft = (userId: string | null) => {
  if (userId) LocalStorageManager.removeItem(draftKey(userId));
};

export const saveProjectDraft = (userId: string | null, values: IProjectFormValues) => {
  if (!userId) return;
  const stored = toStoredValues(values);
  if (JSON.stringify(stored) === JSON.stringify(toStoredValues(toProjectFormValues(null)))) {
    clearProjectDraft(userId);
    return;
  }
  LocalStorageManager.setItem(draftKey(userId), JSON.stringify({ version: 1, values: stored }));
};

const isNullableString = (value: unknown) => value === null || typeof value === "string";

export const readProjectDraft = (userId: string | null): IProjectFormValues | null => {
  if (!userId) return null;
  try {
    const raw = LocalStorageManager.getItem(draftKey(userId));
    if (!raw) return null;
    const draft = JSON.parse(raw) as {
      version?: number;
      values?: Partial<ReturnType<typeof toStoredValues>>;
    } | null;
    const values = draft?.values;
    const assignees = values?.assignees;
    const terms = values?.terms;
    if (
      draft?.version !== 1 ||
      !values ||
      typeof values.name !== "string" ||
      !isNullableString(values.typeId) ||
      !isNullableString(values.stageId) ||
      !assignees ||
      !USER_ROLE_VALUES.every(role => isNullableString(assignees[role])) ||
      !(terms === null || (terms !== undefined && PAYMENT_TERMS_VALUES.includes(terms)))
    )
      return null;
    const restored = toProjectFormValues(null);
    restored.name = values.name;
    restored.typeId = values.typeId ?? null;
    restored.stageId = values.stageId ?? null;
    for (const role of USER_ROLE_VALUES) restored.assignees[role] = assignees[role];
    restored.paymentTerms.terms = values.terms ?? null;
    return restored;
  } catch {
    return null;
  }
};
