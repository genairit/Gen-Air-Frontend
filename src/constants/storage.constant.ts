export const LOCAL_STORAGE_KEYS = {
  SESSION: "gen_air_session",
  PROJECT_FORM_DRAFT: "gen_air_project_form_draft",
} as const;

export const SESSION_STORAGE_KEYS = {
  SESSION: "gen_air_session",
} as const;

export type LocalStorageKeyType =
  | (typeof LOCAL_STORAGE_KEYS)[keyof typeof LOCAL_STORAGE_KEYS]
  | `${typeof LOCAL_STORAGE_KEYS.PROJECT_FORM_DRAFT}:${string}`;

export type SessionStorageKeyType =
  (typeof SESSION_STORAGE_KEYS)[keyof typeof SESSION_STORAGE_KEYS];
