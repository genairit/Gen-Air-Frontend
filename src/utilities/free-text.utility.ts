import {
  FREE_TEXT_STATUS,
  FREE_TEXT_CHIP_STYLES,
  FREE_TEXT_CHIP_PENDING,
  FREE_TEXT_PENDING_LABEL,
  FREE_TEXT_STATUS_LABELS,
  type TFreeTextStatusType,
  FREE_TEXT_STATUS_MESSAGES,
  FREE_TEXT_SUGGESTION_CLASS_NAMES,
  FREE_TEXT_DIVERGENCE_MESSAGE_PREFIX,
} from "../constants/free-text.constants";

import type {
  IFreeTextSegment,
  IFreeTextChipPalette,
  IFreeTextEditDraftResult,
  IFreeTextEditDraftOptions,
  IFreeTextParkedDraftResult,
  IFreeTextWordStatusOptions,
  IFreeTextValidationSummary,
  IFreeTextCommitDraftOptions,
  IFreeTextBackspaceEditOptions,
  IFreeTextSuggestionClassNameOptions,
  IFreeTextPresentDivergentWordOptions,
} from "../interfaces/free-text.interface";

import { REGEX_SANITIZATION } from "../constants/regex.constants";

export const getFreeTextChipPalette = (
  status: TFreeTextStatusType | null
): IFreeTextChipPalette => {
  if (status === null) {
    return FREE_TEXT_CHIP_PENDING;
  }

  return FREE_TEXT_CHIP_STYLES[status];
};

export const getFreeTextChipLabel = (status: TFreeTextStatusType | null): string => {
  if (status === null) {
    return FREE_TEXT_PENDING_LABEL;
  }

  return FREE_TEXT_STATUS_LABELS[status];
};

export const buildFreeTextStatusMessage = (
  summary: IFreeTextValidationSummary | null
): string | null => {
  if (summary == null || summary.status === null) {
    return null;
  }

  const label = FREE_TEXT_STATUS_MESSAGES[summary.status];

  if (label === null) {
    return null;
  }

  return `${label}: ${summary.flaggedSegments.join(", ")}`;
};

export const buildFreeTextDivergenceMessage = (divergentWords?: string[] | null): string | null => {
  const words = divergentWords ?? [];

  if (words.length === 0) {
    return null;
  }

  return `${FREE_TEXT_DIVERGENCE_MESSAGE_PREFIX}: ${words.join(", ")}`;
};

export const splitWords = (value: string): string[] =>
  value.split(REGEX_SANITIZATION.WHITESPACE).filter(word => word.length > 0);

export const insertWord = (words: string[], index: number, word: string): string[] => {
  const next = [...words];

  next.splice(index, 0, word);

  return next;
};

export const removeWordAt = (words: string[], index: number): string[] =>
  words.filter((_, wordIndex) => wordIndex !== index);

export const buildFreeTextCommitDraftState = ({
  words,
  draft,
  editIndex,
}: IFreeTextCommitDraftOptions): string[] | null => {
  const trimmedDraft = draft.trim();

  if (trimmedDraft === "") {
    return null;
  }

  const insertAt = editIndex ?? words.length;

  return insertWord(words, insertAt, trimmedDraft);
};

export const getFreeTextSuggestionClassName = ({
  index,
  activeIndex,
}: IFreeTextSuggestionClassNameOptions): string => {
  if (index !== activeIndex) {
    return "";
  }

  return FREE_TEXT_SUGGESTION_CLASS_NAMES.ACTIVE;
};

const parkPendingDraftBeforeEdit = ({
  words,
  draft,
  editIndex,
  targetIndex,
}: IFreeTextEditDraftOptions): IFreeTextParkedDraftResult => {
  const pendingDraft = draft.trim();

  if (pendingDraft === "") {
    return { words, targetIndex };
  }

  const insertAt = editIndex ?? words.length;
  const parkedWords = insertWord(words, insertAt, pendingDraft);
  const adjustedTargetIndex = insertAt <= targetIndex ? targetIndex + 1 : targetIndex;

  return {
    words: parkedWords,
    targetIndex: adjustedTargetIndex,
  };
};

export const buildFreeTextEditDraftState = ({
  words,
  draft,
  editIndex,
  targetIndex,
}: IFreeTextEditDraftOptions): IFreeTextEditDraftResult => {
  const parkedDraft = parkPendingDraftBeforeEdit({
    words,
    draft,
    editIndex,
    targetIndex,
  });
  const nextDraft = parkedDraft.words[parkedDraft.targetIndex] ?? "";

  return {
    draft: nextDraft,
    editIndex: parkedDraft.targetIndex,
    words: removeWordAt(parkedDraft.words, parkedDraft.targetIndex),
  };
};

export const shouldBackspaceEditPreviousWord = ({
  words,
  draft,
  editIndex,
}: IFreeTextBackspaceEditOptions): boolean => {
  if (draft !== "") {
    return false;
  }

  const position = editIndex ?? words.length;

  return position > 0;
};

export const resolveWordStatuses = (
  words: string[],
  segments: IFreeTextSegment[]
): (TFreeTextStatusType | null)[] =>
  words.map((word, wordIndex) => {
    const segment = segments[wordIndex] ?? null;

    if (segment === null || segment.text !== word) {
      return null;
    }

    return segment.status;
  });

const normalizeFreeTextWord = (word: string): string => word.trim().toLowerCase();

const buildNormalizedWordSet = (words?: string[] | null): Set<string> =>
  new Set((words ?? []).map(normalizeFreeTextWord));

export const resolveFreeTextWordStatuses = ({
  words,
  segments,
  divergentWords,
}: IFreeTextWordStatusOptions): (TFreeTextStatusType | null)[] => {
  const statuses = resolveWordStatuses(words, segments);
  const normalizedDivergentWords = buildNormalizedWordSet(divergentWords);

  if (normalizedDivergentWords.size === 0) {
    return statuses;
  }

  return statuses.map((status, wordIndex) => {
    const word = words[wordIndex] ?? "";

    if (!normalizedDivergentWords.has(normalizeFreeTextWord(word))) {
      return status;
    }

    return FREE_TEXT_STATUS.UNKNOWN;
  });
};

export const selectPresentDivergentWords = ({
  words,
  divergentWords,
}: IFreeTextPresentDivergentWordOptions): string[] => {
  const normalizedFieldWords = buildNormalizedWordSet(words);

  return (divergentWords ?? []).filter(divergentWord =>
    normalizedFieldWords.has(normalizeFreeTextWord(divergentWord))
  );
};
