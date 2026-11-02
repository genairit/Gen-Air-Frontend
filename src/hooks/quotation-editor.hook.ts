import {
  QUOTATION_STATUS,
  QUOTATION_QUERY_KEY,
  QUOTATION_DETAIL_KEY,
  QUOTATION_AUTOSAVE_MS,
} from "../constants/quotation.constant";

import type {
  IQuotation,
  TQuotationStatus,
  IQuotationEditorState,
} from "../interfaces/quotation.interface";

import { useRef, useState } from "react";
import { logger } from "../utilities/logger.utility";
import { useQueryClient } from "@tanstack/react-query";
import { useDelayedAsyncTask } from "./delayed-async-task.hook";
import { quotationService } from "../services/quotation.service";
import { getApiErrorMessage } from "../utilities/api-error.utility";

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
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const version = useRef(initial.version);
  const commandPending = useRef(false);
  const fail = (failure: unknown): void => setError(getApiErrorMessage(failure));
  const cache = async (next: IQuotation): Promise<void> => {
    queryClient.setQueryData(QUOTATION_DETAIL_KEY(next.id), next);
    await queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEY });
  };
  const update = (next: IQuotation): void => {
    if (deleted || !editable || busy || quotation.status === QUOTATION_STATUS.APPROVED) {
      return;
    }
    generation.current += 1;
    setQuotation(next);
    setDirty(true);
    setError(null);
  };
  const accept = async (next: IQuotation): Promise<void> => {
    version.current = next.version;
    setQuotation(next);
    setDirty(false);
    await cache(next);
  };
  const persist = async (): Promise<void> => {
    const submittedGeneration = generation.current;
    setBusy(true);
    try {
      const saved = await quotationService.save({ ...quotation, version: version.current });
      version.current = saved.version;
      await cache(saved);
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
  const command = async (work: () => Promise<IQuotation>): Promise<boolean> => {
    if (deleted || commandPending.current || busy) {
      return false;
    }
    commandPending.current = true;
    setBusy(true);
    setError(null);
    try {
      await accept(await work());
      return true;
    } catch (failure) {
      fail(failure);
      return false;
    } finally {
      commandPending.current = false;
      setBusy(false);
    }
  };
  const remove = async (): Promise<void> => {
    if (!canDelete || deleted || dirty || busy || commandPending.current) {
      return;
    }
    commandPending.current = true;
    setBusy(true);
    setDeleteError(null);
    try {
      await quotationService.delete({ id: quotation.id, version: version.current });
      await queryClient.cancelQueries({
        queryKey: QUOTATION_DETAIL_KEY(quotation.id),
        exact: true,
      });
      await queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEY });
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
    }
  };
  const transition = async (status: TQuotationStatus): Promise<boolean> => {
    if (dirty) {
      return false;
    }
    return command(() => quotationService.transition(quotation, status));
  };
  const acknowledge = async (keys: string[]): Promise<void> => {
    if (dirty) {
      return;
    }
    await command(() => quotationService.acknowledge(quotation, keys));
  };
  const reload = async (): Promise<void> => {
    setDeleteError(null);
    await command(() => quotationService.get(quotation.id));
  };
  return {
    deleted,
    deleteError,
    remove,
    quotation,
    update,
    busy,
    dirty,
    error,
    transition,
    acknowledge,
    reload,
    retry: () => setError(null),
  };
};
