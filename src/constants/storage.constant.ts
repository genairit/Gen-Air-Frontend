export const LOCAL_STORAGE_KEYS = {
  SESSION: "gen_air_session",
} as const;

export const SESSION_STORAGE_KEYS = {
  SESSION: "gen_air_session",
} as const;

export type LocalStorageKeyType = (typeof LOCAL_STORAGE_KEYS)[keyof typeof LOCAL_STORAGE_KEYS];

export type SessionStorageKeyType =
  (typeof SESSION_STORAGE_KEYS)[keyof typeof SESSION_STORAGE_KEYS];
