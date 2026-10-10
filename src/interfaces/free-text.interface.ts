import type {
  TFreeTextStatusType,
  TFreeTextRejectionReasonType,
  TFreeTextValidationActionType,
} from "../constants/free-text.constants";

import type { SxProps } from "@mui/material";
import type { ChangeEvent, CSSProperties, ReactNode } from "react";
import type { TFieldType } from "../components/TextField/constants/textfield.constants";

export interface ITokenResult {
  token: string;
  normalized: string;
  reason: string | null;
  status: TFreeTextStatusType;
  matchedRule?: string | null;
}

export interface IFreeTextRejectionToken extends ITokenResult {
  bloomStatus?: TFreeTextStatusType | null;
}

export interface IFreeTextSafeResponse {
  tokens: IFreeTextRejectionToken[];
  reason: TFreeTextRejectionReasonType;
}

export interface IFreeTextRejection extends IFreeTextSafeResponse {
  words: string[];
}

export interface IUseFreeTextDivergenceResult {
  reset: () => void;
  hasDivergence: boolean;
  divergentWords: string[];
  captureRejection: (error: unknown) => TFreeTextRejectionReasonType | null;
}

export interface IFreeTextSegment {
  end: number;
  text: string;
  start: number;
  reason: string | null;
  status: TFreeTextStatusType;
  matchedRule?: string | null;
}

export interface IFreeTextValidationSummary {
  flaggedSegments: string[];
  status: TFreeTextStatusType | null;
}

export interface IFreeTextValidationResult {
  tokens: ITokenResult[];
  segments: IFreeTextSegment[];
  summary: IFreeTextValidationSummary;
  action: TFreeTextValidationActionType;
}

export interface ISuggestResponse {
  suggestions: string[];
}

export interface IFreeTextChipPalette {
  border: string;
  foreground: string;
  background: string;
}

export interface IFreeTextEditDraftOptions {
  draft: string;
  words: string[];
  targetIndex: number;
  editIndex: number | null;
}

export interface IFreeTextEditDraftResult {
  draft: string;
  words: string[];
  editIndex: number;
}

export interface IFreeTextParkedDraftResult {
  words: string[];
  targetIndex: number;
}

export interface IFreeTextBackspaceEditOptions {
  draft: string;
  words: string[];
  editIndex: number | null;
}

export interface IFreeTextCommitDraftOptions {
  draft: string;
  words: string[];
  editIndex: number | null;
}

export interface IFreeTextSuggestionClassNameOptions {
  index: number;
  activeIndex: number;
}

export interface IFreeTextInputProps {
  value: string;
  title?: string;
  labelSx?: SxProps;
  type?: TFieldType;
  readonly?: boolean;
  required?: boolean;
  placeholder?: string;
  errorMessage?: string;
  validationEndpoint: string;
  labelEndAdornment?: ReactNode;
  divergentWords?: string[] | null;
  setIsValid?: (isValid: boolean) => void;
  onChange?: (value: string, event?: ChangeEvent<HTMLInputElement>) => void;
}

export interface IValidateOptions {
  text: string;
  endpoint: string;
  signal?: AbortSignal;
}

export interface ISuggestOptions {
  query: string;
  limit?: number;
  endpoint: string;
  signal?: AbortSignal;
}

export interface IUseDebouncedFreeTextOptions {
  value: string;
  query: string;
  endpoint: string;
}

export interface IUseDebouncedFreeTextResult {
  suggestions: string[];
  message: string | null;
  isServerValid: boolean;
  segments: IFreeTextSegment[];
  status: TFreeTextStatusType | null;
}

export interface IValidationStateSetters {
  setMessage: (message: string | null) => void;
  setIsServerValid: (isServerValid: boolean) => void;
  setSegments: (segments: IFreeTextSegment[]) => void;
  setStatus: (status: TFreeTextStatusType | null) => void;
}

export interface IApplyValidationResultOptions extends IValidationStateSetters {
  result: IFreeTextValidationResult;
}

export interface IRunValidationOptions extends IValidationStateSetters {
  text: string;
  endpoint: string;
  signal: AbortSignal;
}

export interface IRunSuggestionOptions {
  query: string;
  endpoint: string;
  signal: AbortSignal;
  setSuggestions: (suggestions: string[]) => void;
}

export interface IFreeTextPlaceholderOptions {
  isEditing: boolean;
  hasContent: boolean;
  placeholder?: string;
}

export interface IBuildFreeTextInputRenderModelOptions {
  draft: string;
  words: string[];
  required?: boolean;
  placeholder?: string;
  errorMessage?: string;
  editIndex: number | null;
  serverMessage: string | null;
  divergentWords?: string[] | null;
}

export interface IFreeTextWordStatusOptions {
  words: string[];
  segments: IFreeTextSegment[];
  divergentWords?: string[] | null;
}

export interface IFreeTextPresentDivergentWordOptions {
  words: string[];
  divergentWords?: string[] | null;
}

export interface IFreeTextInputRenderModel {
  inputPosition: number;
  leadingWords: string[];
  trailingWords: string[];
  inputStyle: CSSProperties;
  requiredIndicator: string;
  activePlaceholder: string;
  activeErrorMessage: string | null;
}
