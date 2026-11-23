import { getSession } from "../store/session.store";
import { isRecord } from "../utilities/guards/primitive.guard";
import { SESSION_STORAGE_KEYS } from "../constants/storage.constant";
import type { IRecommendedCloneCommand } from "../interfaces/quotation.interface";

export class QuotationCloneStorageManager {
  static scope(sourceId: string): string {
    return `${SESSION_STORAGE_KEYS.QUOTATION_CLONE}:${getSession()?.user.id ?? "anonymous"}:${sourceId}`;
  }

  static read(key: string): IRecommendedCloneCommand | null {
    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null");
      if (
        !isRecord(stored) ||
        typeof stored.sourceId !== "string" ||
        typeof stored.targetBrand !== "string" ||
        typeof stored.sourceVersion !== "number" ||
        typeof stored.idempotencyKey !== "string"
      ) {
        return null;
      }

      return {
        sourceId: stored.sourceId,
        targetBrand: stored.targetBrand,
        sourceVersion: stored.sourceVersion,
        idempotencyKey: stored.idempotencyKey,
      };
    } catch {
      return null;
    }
  }

  static write(key: string, command: IRecommendedCloneCommand): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(command));
    } catch {
      // The active controller retains retry identity when storage is unavailable.
    }
  }

  static clear(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Storage may be unavailable in private browsing.
    }
  }
}
