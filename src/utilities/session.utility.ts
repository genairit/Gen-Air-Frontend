import { isRecord } from "./guards/primitive.guard";
import type { ISession } from "../interfaces/session.interface";
import { isApiUser, isAuthorizedUser } from "./guards/api.guard";
import { LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from "../constants/storage.constant";
import { LocalStorageManager, SessionStorageManager } from "../managers/web-storage.manager";

const parseSession = (serialized: string | null) => {
  if (!serialized) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(serialized);

    if (!isRecord(parsed) || typeof parsed.accessToken !== "string" || !isApiUser(parsed.user)) {
      return null;
    }

    if (isAuthorizedUser(parsed.user)) {
      return { accessToken: parsed.accessToken, user: parsed.user };
    }

    if (Reflect.has(parsed.user, "permissions")) {
      return null;
    }

    return { accessToken: parsed.accessToken, user: { ...parsed.user, permissions: [] } };
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
  clearStoredSession();

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

export const isSessionRemembered = (): boolean =>
  LocalStorageManager.getItem(LOCAL_STORAGE_KEYS.SESSION) !== null;
