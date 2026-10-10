import { isApiUser } from "./guards/api.guard";
import { isRecord } from "./guards/primitive.guard";
import type { ISession } from "../interfaces/session.interface";
import { LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from "../constants/storage.constant";
import { LocalStorageManager, SessionStorageManager } from "../managers/web-storage.manager";

const isSession = (value: unknown): value is ISession =>
  isRecord(value) && typeof value.accessToken === "string" && isApiUser(value.user);

const parseSession = (serialized: string | null) => {
  if (!serialized) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(serialized);

    return isSession(parsed) ? parsed : null;
  } catch {
    // A corrupted stored session is discarded and the user signs in again.
    return null;
  }
};

export const readStoredSession = () =>
  parseSession(LocalStorageManager.getItem(LOCAL_STORAGE_KEYS.SESSION)) ??
  parseSession(SessionStorageManager.getItem(SESSION_STORAGE_KEYS.SESSION));

export const persistSession = (session: ISession, isRemembered: boolean) => {
  const serialized = JSON.stringify(session);

  if (isRemembered) {
    LocalStorageManager.setItem(LOCAL_STORAGE_KEYS.SESSION, serialized);
    return;
  }

  SessionStorageManager.setItem(SESSION_STORAGE_KEYS.SESSION, serialized);
};

export const clearStoredSession = () => {
  LocalStorageManager.removeItem(LOCAL_STORAGE_KEYS.SESSION);
  SessionStorageManager.removeItem(SESSION_STORAGE_KEYS.SESSION);
};
