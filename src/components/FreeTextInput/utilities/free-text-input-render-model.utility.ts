import {
  selectPresentDivergentWords,
  buildFreeTextDivergenceMessage,
} from "../../../utilities/free-text.utility";

import type {
  IFreeTextInputRenderModel,
  IFreeTextPlaceholderOptions,
  IBuildFreeTextInputRenderModelOptions,
} from "../../../interfaces/free-text.interface";

import { ENTRY_STYLE, ENTRY_INLINE_STYLE } from "../FreeTextInput.style";
import { FREE_TEXT_DEFAULT_PLACEHOLDER } from "../../../constants/free-text.constants";

const resolveActivePlaceholder = ({
  isEditing,
  hasContent,
  placeholder,
}: IFreeTextPlaceholderOptions): string => {
  if (isEditing) {
    return "";
  }

  if (hasContent) {
    return "";
  }

  return placeholder ?? FREE_TEXT_DEFAULT_PLACEHOLDER;
};

export const buildFreeTextInputRenderModel = ({
  draft,
  words,
  required,
  editIndex,
  placeholder,
  errorMessage,
  serverMessage,
  divergentWords,
}: IBuildFreeTextInputRenderModelOptions): IFreeTextInputRenderModel => {
  const inputPosition = editIndex ?? words.length;
  const isEditing = editIndex !== null;
  const hasContent = words.length > 0 || draft.length > 0;
  const presentDivergentWords = selectPresentDivergentWords({ words, divergentWords });
  const divergenceMessage = buildFreeTextDivergenceMessage(presentDivergentWords);

  return {
    inputPosition,
    requiredIndicator: required ? " *" : "",
    trailingWords: words.slice(inputPosition),
    leadingWords: words.slice(0, inputPosition),
    inputStyle: isEditing ? ENTRY_INLINE_STYLE : ENTRY_STYLE,
    activeErrorMessage: divergenceMessage ?? errorMessage ?? serverMessage,
    activePlaceholder: resolveActivePlaceholder({
      isEditing,
      hasContent,
      placeholder,
    }),
  };
};
