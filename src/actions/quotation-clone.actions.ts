import type {
  ICloneRefreshInput,
  ICloneCompletionInput,
} from "../interfaces/quotation-clone.interface";

import { logger } from "../utilities/logger.utility";
import { buildQuotationPath } from "../utilities/route.utility";
import { TASK_QUOTATION_KEYS } from "../constants/task-quotation.constant";
import { CommandIdentityManager } from "../managers/command-identity.manager";
import type { ICloneExecution } from "../interfaces/quotation-clone.interface";
import { QUOTATION_SHARING_KEYS } from "../constants/quotation-sharing.constant";
import { AuthorizationContext } from "../managers/authorization-context.manager";
import type { IRecommendedCloneCommand } from "../interfaces/quotation.interface";
import { cloneFailure, safeCloneDiagnostics } from "../utilities/quotation-clone.utility";
import { QuotationCloneStorageManager } from "../managers/quotation-clone-storage.manager";
import { QUOTATION_DETAIL_HEADING_ID, QUOTATION_QUERY_KEY } from "../constants/quotation.constant";

export class QuotationCloneCommand {
  private active = false;
  private pending = false;
  private completed = false;
  private command: IRecommendedCloneCommand | null = null;
  private authorization: AuthorizationContext | null = null;

  private readonly sourceId: string;
  private readonly storageKey: string;

  constructor(sourceId: string) {
    this.sourceId = sourceId;
    this.storageKey = QuotationCloneStorageManager.scope(sourceId);
    const stored = QuotationCloneStorageManager.read(this.storageKey);
    this.command = stored?.sourceId === sourceId ? stored : null;
  }

  getCommand(): IRecommendedCloneCommand | null {
    return this.completed ? null : this.command;
  }

  getTargetBrand(): string {
    return this.command?.targetBrand ?? "";
  }

  activate(): void {
    this.active = true;
  }

  deactivate(): void {
    this.active = false;
  }

  async refreshSource(input: ICloneRefreshInput): Promise<void> {
    const context = new AuthorizationContext();
    const result = await input.refresh();
    if (!result.isSuccess || !this.isCurrent(context)) {
      return;
    }

    this.reset();
    input.onFailure(null);
  }

  reset(): void {
    if (this.pending) {
      return;
    }

    QuotationCloneStorageManager.clear(this.storageKey);
    this.command = null;
    this.authorization = null;
  }

  private isCurrent(context: AuthorizationContext): boolean {
    return this.active && context.isCurrent();
  }

  async submit(input: ICloneExecution): Promise<void> {
    if (this.pending || this.completed || !this.active) {
      return;
    }

    if (this.command?.targetBrand !== input.targetBrand) {
      this.reset();
    }

    const context = this.authorization ?? new AuthorizationContext();
    if (!context.isCurrent()) {
      return;
    }

    const command = this.command ?? {
      sourceId: this.sourceId,
      targetBrand: input.targetBrand,
      sourceVersion: input.sourceVersion,
      idempotencyKey: CommandIdentityManager.create(),
    };
    this.command = command;
    QuotationCloneStorageManager.write(this.storageKey, command);
    this.authorization = context;
    this.pending = true;
    input.onFailure(null);
    input.onPending(true);

    try {
      const quotation = await input.execute(command);
      if (!this.isCurrent(context)) {
        return;
      }

      QuotationCloneStorageManager.clear(this.storageKey);
      this.completed = true;
      await input.onSuccess(quotation, (): boolean => this.isCurrent(context));
    } catch (error: unknown) {
      logger.error("Recommended quotation clone failed", safeCloneDiagnostics(error));
      if (!this.isCurrent(context)) {
        return;
      }

      input.onFailure(cloneFailure(error));
    } finally {
      this.pending = false;
      if (this.isCurrent(context)) {
        input.onPending(false);
      }
    }
  }
}

export const completeQuotationClone = async (input: ICloneCompletionInput): Promise<void> => {
  await Promise.all([
    input.queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEY }),
    input.queryClient.invalidateQueries({ queryKey: [TASK_QUOTATION_KEYS.ROOT] }),
    input.queryClient.invalidateQueries({
      queryKey: [QUOTATION_SHARING_KEYS.PROJECT_QUOTATIONS_ROOT],
    }),
  ]);
  if (!input.isCurrent()) {
    return;
  }

  await input.navigate(`${buildQuotationPath(input.quotation.id)}#${QUOTATION_DETAIL_HEADING_ID}`);
};
