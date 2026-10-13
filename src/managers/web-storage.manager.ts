import type { LocalStorageKeyType, SessionStorageKeyType } from "../constants/storage.constant";

const readItem = (storage: () => Storage, key: string) => {
  try {
    return storage().getItem(key);
  } catch {
    // Storage throws in private mode or when blocked; treat it as empty.
    return null;
  }
};

const writeItem = (storage: () => Storage, key: string, value: string) => {
  try {
    storage().setItem(key, value);
  } catch {
    // Storage throws in private mode or when full; the session then lives in memory only.
  }
};

const removeItem = (storage: () => Storage, key: string) => {
  try {
    storage().removeItem(key);
  } catch {
    // Storage throws in private mode; nothing was persisted to remove.
  }
};

export class LocalStorageManager {
  static getItem(key: LocalStorageKeyType): string | null {
    return readItem(() => localStorage, key);
  }

  static setItem(key: LocalStorageKeyType, value: string): void {
    writeItem(() => localStorage, key, value);
  }

  static removeItem(key: LocalStorageKeyType): void {
    removeItem(() => localStorage, key);
  }
}

export class SessionStorageManager {
  static getItem(key: SessionStorageKeyType): string | null {
    return readItem(() => sessionStorage, key);
  }

  static setItem(key: SessionStorageKeyType, value: string): void {
    writeItem(() => sessionStorage, key, value);
  }

  static removeItem(key: SessionStorageKeyType): void {
    removeItem(() => sessionStorage, key);
  }
}
