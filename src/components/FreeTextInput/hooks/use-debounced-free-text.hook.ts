import {
  FREE_TEXT_STATUS,
  FREE_TEXT_MAX_LENGTH,
  FREE_TEXT_DEBOUNCE_MS,
  FREE_TEXT_SUGGEST_LIMIT,
  type TFreeTextStatusType,
  FREE_TEXT_VALIDATION_ACTION,
  FREE_TEXT_LENGTH_ERROR_MESSAGE,
} from "../../../constants/free-text.constants";

import type {
  IFreeTextSegment,
  IRunValidationOptions,
  IRunSuggestionOptions,
  IValidationStateSetters,
  IUseDebouncedFreeTextResult,
  IUseDebouncedFreeTextOptions,
  IApplyValidationResultOptions,
} from "../../../interfaces/free-text.interface";

import axios from "axios";
import { useEffect, useState } from "react";
import { freeTextService } from "../../../services/free-text.service";
import { buildFreeTextStatusMessage } from "../../../utilities/free-text.utility";
import { useDebouncedAbortableCallback } from "../../../hooks/debounced-abortable-callback.hook";

const isCancelledRequest = (error: unknown, signal: AbortSignal): boolean => {
  return signal.aborted || axios.isCancel(error);
};

const resetValidationState = ({
  setStatus,
  setMessage,
  setSegments,
  setIsServerValid,
}: IValidationStateSetters): void => {
  setSegments([]);
  setStatus(null);
  setMessage(null);
  setIsServerValid(true);
};

const setLengthValidationState = ({
  setStatus,
  setMessage,
  setSegments,
  setIsServerValid,
}: IValidationStateSetters): void => {
  setSegments([]);
  setIsServerValid(false);
  setStatus(FREE_TEXT_STATUS.BLOCK);
  setMessage(FREE_TEXT_LENGTH_ERROR_MESSAGE);
};

const applyValidationResult = ({
  result,
  setStatus,
  setMessage,
  setSegments,
  setIsServerValid,
}: IApplyValidationResultOptions): void => {
  setSegments(result.segments);
  setStatus(result.summary.status);
  setMessage(buildFreeTextStatusMessage(result.summary));
  setIsServerValid(result.action === FREE_TEXT_VALIDATION_ACTION.ALLOW);
};

const runValidation = async ({
  text,
  endpoint,
  signal,
  setStatus,
  setMessage,
  setSegments,
  setIsServerValid,
}: IRunValidationOptions): Promise<void> => {
  try {
    const result = await freeTextService.validate({
      text,
      signal,
      endpoint,
    });

    if (signal.aborted) {
      return;
    }

    applyValidationResult({
      result,
      setStatus,
      setMessage,
      setSegments,
      setIsServerValid,
    });
  } catch (error) {
    if (isCancelledRequest(error, signal)) {
      return;
    }

    console.error("Free-text validation failed", error);

    resetValidationState({ setStatus, setMessage, setSegments, setIsServerValid });
  }
};

const runSuggestion = async ({
  query,
  endpoint,
  signal,
  setSuggestions,
}: IRunSuggestionOptions): Promise<void> => {
  try {
    const result = await freeTextService.suggest({
      query,
      endpoint,
      signal,
      limit: FREE_TEXT_SUGGEST_LIMIT,
    });

    if (signal.aborted) {
      return;
    }

    setSuggestions(result.slice(0, FREE_TEXT_SUGGEST_LIMIT));
  } catch (error) {
    if (isCancelledRequest(error, signal)) {
      return;
    }

    console.error("Free-text suggestions failed", error);
    setSuggestions([]);
  }
};

export const useDebouncedFreeText = ({
  value,
  query,
  endpoint,
}: IUseDebouncedFreeTextOptions): IUseDebouncedFreeTextResult => {
  const [isServerValid, setIsServerValid] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [segments, setSegments] = useState<IFreeTextSegment[]>([]);
  const [status, setStatus] = useState<TFreeTextStatusType | null>(null);

  const trimmedQuery = query.trim();
  const shouldSuggest = trimmedQuery !== "";
  const shouldValidate = value.trim() !== "" && value.length < FREE_TEXT_MAX_LENGTH;

  useEffect(() => {
    const validationSetters = {
      setStatus,
      setMessage,
      setSegments,
      setIsServerValid,
    };

    if (value.trim() === "") {
      resetValidationState(validationSetters);

      return;
    }

    if (value.length >= FREE_TEXT_MAX_LENGTH) {
      setLengthValidationState(validationSetters);

      return;
    }
  }, [value, endpoint]);

  useDebouncedAbortableCallback({
    isEnabled: shouldValidate,
    delayMs: FREE_TEXT_DEBOUNCE_MS,
    dependencies: [value, endpoint],
    callback: signal =>
      runValidation({
        signal,
        text: value,
        endpoint,
        setStatus,
        setMessage,
        setSegments,
        setIsServerValid,
      }),
  });

  useEffect(() => {
    if (trimmedQuery === "") {
      setSuggestions([]);

      return;
    }
  }, [trimmedQuery]);

  useDebouncedAbortableCallback({
    isEnabled: shouldSuggest,
    delayMs: FREE_TEXT_DEBOUNCE_MS,
    dependencies: [trimmedQuery, endpoint],
    callback: signal =>
      runSuggestion({
        signal,
        endpoint,
        setSuggestions,
        query: trimmedQuery,
      }),
  });

  return { status, message, segments, isServerValid, suggestions };
};
