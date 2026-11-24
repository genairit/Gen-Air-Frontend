import {
  safeCloneDiagnostics,
  isRecommendedCloneCommand,
} from "../utilities/quotation-clone.utility";

import { getSession } from "../store/session.store";
import { logger } from "../utilities/logger.utility";
import { SESSION_STORAGE_KEYS } from "../constants/storage.constant";
import type { IRecommendedCloneCommand } from "../interfaces/quotation.interface";

export class QuotationCloneStorageManager {
  private static readonly commands = new Map<string, IRecommendedCloneCommand | null>();

  static scope(sourceId: string): string {
    return `${SESSION_STORAGE_KEYS.QUOTATION_CLONE}:${getSession()?.user.id ?? "anonymous"}:${sourceId}`;
  }

  static read(key: string): IRecommendedCloneCommand | null {
    if (this.commands.has(key)) {
      return this.commands.get(key) ?? null;
    }

    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null");
      const command = isRecommendedCloneCommand(stored) ? stored : null;
      this.commands.set(key, command);
      return command;
    } catch (error: unknown) {
      logger.warn("Quotation clone storage read failed", safeCloneDiagnostics(error));
      return this.commands.get(key) ?? null;
    }
  }

  static write(key: string, command: IRecommendedCloneCommand): void {
    this.commands.set(key, command);
    try {
      sessionStorage.setItem(key, JSON.stringify(command));
    } catch (error: unknown) {
      logger.warn("Quotation clone storage write failed", safeCloneDiagnostics(error));
    }
  }

  static clear(key: string): void {
    this.commands.set(key, null);
    try {
      sessionStorage.removeItem(key);
    } catch (error: unknown) {
      logger.warn("Quotation clone storage clear failed", safeCloneDiagnostics(error));
    }
  }
}
