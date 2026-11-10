import {
  QUOTATION_STATUS,
  QUOTATION_COMMAND,
  QUOTATION_QUERY_KEY,
  QUOTATION_DETAIL_KEY,
  QUOTATION_AUTOSAVE_MS,
  type TQuotationCommand,
} from "../constants/quotation.constant";

import type {
  IQuotation,
  TQuotationStatus,
  IQuotationEditorState,
} from "../interfaces/quotation.interface";

import { isAxiosError } from "axios";
import { useRef, useState } from "react";
import { logger } from "../utilities/logger.utility";
import { useQueryClient } from "@tanstack/react-query";
import { HTTP_STATUS } from "../constants/api.constant";
import { useDelayedAsyncTask } from "./delayed-async-task.hook";
import { quotationService } from "../services/quotation.service";
import { getApiErrorMessage } from "../utilities/api-error.utility";
import { AuthorizationContext } from "../managers/authorization-context.manager";

export const useQuotationEditor = (
  initial: IQuotation,
  editable: boolean,
  canDelete = false,
): IQuotationEditorState => {
  const queryClient = useQueryClient();
  const [quotation, setQuotation] = useState(initial);
  const [deleted, setDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [commandBusy, setCommandBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVersionConflict, setHasVersionConflict] = useState(false);
  const generation = useRef(0);
  const version = useRef(initial.version);
  const commandPending = useRef(false);
  const fail = (failure: unknown): void => setError(getApiErrorMessage(failure));
  const cache = async (next: IQuotation, context: AuthorizationContext): Promise<void> => {
    context.assertCurrent();
    queryClient.setQueryData(QUOTATION_DETAIL_KEY(next.id), next);
    await queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEY });
    context.assertCurrent();
  };
  const update = (next: IQuotation): void => {
    if (
      deleted ||
      !editable ||
      commandPending.current ||
      quotation.status === QUOTATION_STATUS.APPROVED ||
      quotation.status === QUOTATION_STATUS.CANCELLED
    ) {
      return;
    }
    generation.current += 1;
    setQuotation(next);
    setDirty(true);
    setError(null);
    setHasVersionConflict(false);
  };
  const accept = async (next: IQuotation, context: AuthorizationContext): Promise<void> => {
    context.assertCurrent();
    version.current = next.version;
    setQuotation(next);
    setDirty(false);
    await cache(next, context);
  };
  const persist = async (): Promise<void> => {
    const context = new AuthorizationContext();
    const submittedGeneration = generation.current;
    setBusy(true);
    try {
      const saved = await quotationService.save({ ...quotation, version: version.current });
      context.assertCurrent();
      version.current = saved.version;
      await cache(saved, context);
      if (generation.current === submittedGeneration) {
        setQuotation(saved);
        setDirty(false);
        return;
      }
      setQuotation(current => ({ ...current, version: saved.version }));
    } catch (failure) {
      fail(failure);
    } finally {
      setBusy(false);
    }
  };
  const autosaveEnabled = !deleted && dirty && !busy && !error && editable;
  useDelayedAsyncTask({
    enabled: autosaveEnabled,
    delayMs: QUOTATION_AUTOSAVE_MS,
    task: persist,
    onError: fail,
  });
  const command = async (
    operation: TQuotationCommand,
    work: () => Promise<IQuotation>,
  ): Promise<boolean> => {
    if (deleted || commandPending.current || busy) {
      return false;
    }
    commandPending.current = true;
    const context = new AuthorizationContext();
    setBusy(true);
    setCommandBusy(true);
    setError(null);
    if (operation !== QUOTATION_COMMAND.RELOAD) {
      setHasVersionConflict(false);
    }
    try {
      await accept(await work(), context);
      context.assertCurrent();
      setHasVersionConflict(false);
      return true;
    } catch (failure) {
      const error = getApiErrorMessage(failure);
      logger.error("Quotation command failed", {
        quotationId: quotation.id,
        operation,
        error,
      });
      setError(error);
      const isCancellationCommand =
        operation === QUOTATION_COMMAND.CANCEL || operation === QUOTATION_COMMAND.RESTORE;
      if (isCancellationCommand) {
        setHasVersionConflict(
          isAxiosError(failure) && failure.response?.status === HTTP_STATUS.CONFLICT,
        );
      }
      return false;
    } finally {
      commandPending.current = false;
      setBusy(false);
      setCommandBusy(false);
    }
  };
  const remove = async (): Promise<void> => {
    if (!canDelete || deleted || dirty || busy || commandPending.current) {
      return;
    }
    commandPending.current = true;
    const context = new AuthorizationContext();
    setBusy(true);
    setCommandBusy(true);
    setDeleteError(null);
    try {
      await quotationService.delete({ id: quotation.id, version: version.current });
      context.assertCurrent();
      await queryClient.cancelQueries({
        queryKey: QUOTATION_DETAIL_KEY(quotation.id),
        exact: true,
      });
      context.assertCurrent();
      await queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEY });
      context.assertCurrent();
      setDeleted(true);
    } catch (failure) {
      logger.error("Failed to delete quotation", {
        quotationId: quotation.id,
        error: getApiErrorMessage(failure),
      });
      setDeleteError(getApiErrorMessage(failure));
    } finally {
      commandPending.current = false;
      setBusy(false);
      setCommandBusy(false);
    }
  };
  const transition = async (status: TQuotationStatus): Promise<boolean> => {
    if (dirty) {
      return false;
    }
    return command(QUOTATION_COMMAND.TRANSITION, () =>
      quotationService.transition(quotation, status),
    );
  };
  const cancel = async (reason: string): Promise<boolean> => {
    const normalizedReason = reason.trim();
    if (dirty || !normalizedReason) {
      return false;
    }

    return command(QUOTATION_COMMAND.CANCEL, () =>
      quotationService.cancel({ id: quotation.id, version: version.current }, normalizedReason),
    );
  };
  const restore = async (): Promise<boolean> => {
    if (dirty) {
      return false;
    }

    return command(QUOTATION_COMMAND.RESTORE, () =>
      quotationService.restore({ id: quotation.id, version: version.current }),
    );
  };
  const acknowledge = async (keys: string[]): Promise<void> => {
    if (dirty) {
      return;
    }
    await command(QUOTATION_COMMAND.ACKNOWLEDGE, () =>
      quotationService.acknowledge(quotation, keys),
    );
  };
  const reload = async (): Promise<boolean> => {
    setDeleteError(null);
    return command(QUOTATION_COMMAND.RELOAD, () => quotationService.get(quotation.id));
  };
  return {
    deleted,
    deleteError,
    remove,
    cancel,
    restore,
    quotation,
    update,
    busy,
    commandBusy,
    dirty,
    error,
    hasVersionConflict,
    transition,
    acknowledge,
    reload,
    retry: () => setError(null),
  };
};
