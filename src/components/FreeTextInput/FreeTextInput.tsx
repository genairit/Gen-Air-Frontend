import {
  useRef,
  type FC,
  useMemo,
  useState,
  useEffect,
  type MouseEvent,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import {
  splitWords,
  removeWordAt,
  resolveFreeTextWordStatuses,
  buildFreeTextEditDraftState,
  buildFreeTextCommitDraftState,
  shouldBackspaceEditPreviousWord,
} from "../../utilities/free-text.utility";

import {
  FREE_TEXT_KEYS,
  FREE_TEXT_SUGGESTION_NAVIGATION_DELTAS,
  type TFreeTextSuggestionNavigationKeyType,
} from "../../constants/free-text.constants";

import { Box, Typography } from "@mui/material";
import { useStyles } from "./FreeTextInput.style";
import FreeTextChip from "./components/FreeTextChip";
import FreeTextSuggestions from "./components/FreeTextSuggestions";
import { useDebouncedFreeText } from "./hooks/use-debounced-free-text.hook";
import type { IFreeTextInputProps } from "../../interfaces/free-text.interface";
import { buildFreeTextInputRenderModel } from "./utilities/free-text-input-render-model.utility";

type TFreeTextKeyHandler = (event: KeyboardEvent<HTMLInputElement>) => boolean;

const isSuggestionNavigationKey = (key: string): key is TFreeTextSuggestionNavigationKeyType =>
  key === FREE_TEXT_KEYS.ARROW_DOWN || key === FREE_TEXT_KEYS.ARROW_UP;

const FreeTextInput: FC<IFreeTextInputProps> = ({
  value,
  title,
  labelSx,
  onChange,
  readonly,
  required,
  setIsValid,
  placeholder,
  errorMessage,
  divergentWords,
  labelEndAdornment,
  validationEndpoint,
}) => {
  const [draft, setDraft] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const words = useMemo(() => splitWords(value), [value]);

  const { segments, message, isServerValid, suggestions } = useDebouncedFreeText({
    value,
    query: draft,
    endpoint: validationEndpoint,
  });

  const wordStatuses = useMemo(
    () => resolveFreeTextWordStatuses({ words, segments, divergentWords }),
    [words, segments, divergentWords]
  );

  const showSuggestions = isFocused && !readonly && suggestions.length > 0;
  const styles = useStyles({ isFocused, isOpen: showSuggestions });

  const hasLabel = Boolean(title) || labelEndAdornment != null;

  const labelRowStyle = { ...styles.labelRow, ...labelSx };
  const labelTextStyle = { ...(labelSx ?? styles.label), margin: 0 };

  const renderModel = buildFreeTextInputRenderModel({
    words,
    draft,
    required,
    editIndex,
    placeholder,
    errorMessage,
    divergentWords,
    serverMessage: message,
  });

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions]);

  useEffect(() => {
    setIsValid?.(isServerValid);
  }, [isServerValid, setIsValid]);

  const emitWordsChange = (nextWords: string[]): void => {
    onChange?.(nextWords.join(" "));
  };

  const resetCommittedDraftState = (): void => {
    setDraft("");
    setEditIndex(null);
    setActiveIndex(0);
  };

  const commitDraft = (draft: string): void => {
    const committedWords = buildFreeTextCommitDraftState({
      words,
      draft,
      editIndex,
    });

    resetCommittedDraftState();

    if (committedWords === null) {
      return;
    }

    emitWordsChange(committedWords);
  };

  const removeChip = (index: number): void => {
    emitWordsChange(removeWordAt(words, index));
  };

  const editChip = (index: number): void => {
    const editDraftState = buildFreeTextEditDraftState({
      words,
      draft,
      editIndex,
      targetIndex: index,
    });

    setDraft(editDraftState.draft);
    setEditIndex(editDraftState.editIndex);
    emitWordsChange(editDraftState.words);
    inputRef.current?.focus();
  };

  const selectSuggestion = (suggestion: string) => {
    commitDraft(suggestion);
    inputRef.current?.focus();
  };

  const handleFieldMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    event.preventDefault();
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    setIsFocused(false);

    if (draft.trim()) {
      commitDraft(draft);
    }
  };

  const moveActiveIndex = (delta: number) => {
    const count = suggestions.length;

    setActiveIndex((activeIndex + delta + count) % count);
  };

  const handleActiveSuggestionSelection: TFreeTextKeyHandler = event => {
    const activeSuggestion = suggestions[activeIndex] ?? null;
    const shouldSelectActiveSuggestion =
      event.key === FREE_TEXT_KEYS.ENTER && showSuggestions && activeSuggestion !== null;

    if (!shouldSelectActiveSuggestion) {
      return false;
    }

    event.preventDefault();
    selectSuggestion(activeSuggestion);

    return true;
  };

  const handleDraftCommit: TFreeTextKeyHandler = event => {
    const shouldCommitDraft =
      event.key === FREE_TEXT_KEYS.SPACE || event.key === FREE_TEXT_KEYS.ENTER;

    if (!shouldCommitDraft) {
      return false;
    }

    event.preventDefault();
    commitDraft(draft);

    return true;
  };

  const handleBackspaceEdit: TFreeTextKeyHandler = event => {
    const shouldHandleBackspaceEdit =
      event.key === FREE_TEXT_KEYS.BACKSPACE &&
      shouldBackspaceEditPreviousWord({ words, draft, editIndex });

    if (!shouldHandleBackspaceEdit) {
      return false;
    }

    const position = editIndex ?? words.length;

    event.preventDefault();
    editChip(position - 1);

    return true;
  };

  const handleEscapeBlur: TFreeTextKeyHandler = event => {
    if (event.key !== FREE_TEXT_KEYS.ESCAPE) {
      return false;
    }

    inputRef.current?.blur();

    return true;
  };

  const handleSuggestionNavigation: TFreeTextKeyHandler = event => {
    if (!showSuggestions) {
      return false;
    }

    if (!isSuggestionNavigationKey(event.key)) {
      return false;
    }

    event.preventDefault();
    moveActiveIndex(FREE_TEXT_SUGGESTION_NAVIGATION_DELTAS[event.key]);

    return true;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const keyHandlers: TFreeTextKeyHandler[] = [
      handleActiveSuggestionSelection,
      handleDraftCommit,
      handleBackspaceEdit,
      handleEscapeBlur,
      handleSuggestionNavigation,
    ];

    keyHandlers.some(handleKey => handleKey(event));
  };

  const handleDraftChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setDraft(event.target.value);
  };

  const renderChip = (word: string, index: number) => {
    const status = wordStatuses[index] ?? null;

    return (
      <FreeTextChip
        word={word}
        status={status}
        isReadonly={readonly}
        key={`${word}-${index}`}
        onEdit={() => editChip(index)}
        onRemove={() => removeChip(index)}
      />
    );
  };

  return (
    <Box sx={styles.container}>
      {hasLabel && (
        <Box sx={labelRowStyle}>
          <Typography sx={labelTextStyle}>
            {title}
            {renderModel.requiredIndicator}
          </Typography>
          {labelEndAdornment}
        </Box>
      )}

      <Box sx={styles.fieldWrap}>
        <Box sx={styles.field} onMouseDown={handleFieldMouseDown}>
          {renderModel.leadingWords.map(renderChip)}
          <input
            dir="rtl"
            value={draft}
            ref={inputRef}
            disabled={readonly}
            onBlur={handleBlur}
            key="free-text-entry"
            onKeyDown={handleKeyDown}
            onChange={handleDraftChange}
            style={renderModel.inputStyle}
            size={Math.max(draft.length, 1)}
            onFocus={() => setIsFocused(true)}
            placeholder={renderModel.activePlaceholder}
          />

          {renderModel.trailingWords.map((word, index) =>
            renderChip(word, renderModel.inputPosition + index)
          )}
        </Box>

        {showSuggestions && (
          <FreeTextSuggestions
            activeIndex={activeIndex}
            suggestions={suggestions}
            onSelect={selectSuggestion}
          />
        )}
      </Box>

      {renderModel.activeErrorMessage && (
        <Typography sx={styles.errorText}>{renderModel.activeErrorMessage}</Typography>
      )}
    </Box>
  );
};

export default FreeTextInput;
