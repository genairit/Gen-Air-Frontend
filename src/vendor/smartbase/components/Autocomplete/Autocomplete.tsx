import {
  AUTOCOMPLETE_TEXTS,
  AUTOCOMPLETE_LAYOUT,
  AUTOCOMPLETE_COLORS,
  AUTOCOMPLETE_MOTION as MOTION,
} from "../../constants/autocomplete.constant";

import { useStyles } from "./Autocomplete.style";
import { type FC, useImperativeHandle } from "react";
import OptionList from "./components/OptionList/OptionList";
import { usePresence } from "../../hooks/use-presence.hook";
import SearchField from "./components/SearchField/SearchField";
import { Box, InputBase, ClickAwayListener } from "@mui/material";
import { useGeneratedId } from "../../hooks/use-generated-id.hook";
import { useKeyboardInset } from "../../hooks/use-keyboard-inset.hook";
import { useAutocompleteSearch } from "./hooks/use-autocomplete-search.hook";
import SearchModeOverlay from "./components/SearchModeOverlay/SearchModeOverlay";
import { type IAutocompleteProps } from "../../interfaces/autocomplete.interface";
import { getComboboxAriaProps, getOptionId } from "./utilities/autocomplete.utility";

const Autocomplete: FC<IAutocompleteProps> = ({
  hint,
  label,
  value,
  colors,
  options,
  onChange,
  onSearch,
  disabled = false,
  startIcon,
  onLoadMore,
  actionsRef,
  required = false,
  hasShadow = true,
  isLoading = false,
  isClearable = true,
  isSearchMode = true,
  isInputReadOnly = false,
  isSearchIconShown = true,
  isMatchHighlighted = true,
  searchModeContainer = null,
  emptyText = AUTOCOMPLETE_TEXTS.EMPTY,
  cancelText = AUTOCOMPLETE_TEXTS.CANCEL,
  clearLabel = AUTOCOMPLETE_TEXTS.CLEAR,
  pageSize = AUTOCOMPLETE_LAYOUT.PAGE_SIZE,
  loadingText = AUTOCOMPLETE_TEXTS.LOADING,
  placeholder = AUTOCOMPLETE_TEXTS.PLACEHOLDER,
  maxVisibleRows = AUTOCOMPLETE_LAYOUT.DEFAULT_VISIBLE_ROWS,
}) => {
  const inputId = useGeneratedId();
  const listId = `${inputId}-list`;
  const hintId = `${inputId}-hint`;
  const searchInputId = `${inputId}-search`;
  const palette = { ...AUTOCOMPLETE_COLORS, ...colors };

  const styles = useStyles({ colors: palette, hasShadow });

  const search = useAutocompleteSearch({
    value,
    options,
    pageSize,
    onChange,
    onSearch,
    isLoading,
    onLoadMore,
    autoFocusSearch: isSearchMode,
  });

  useImperativeHandle(actionsRef, () => ({ open: search.openSearch }));

  const isDropDownOpen = search.isOpen && !isSearchMode;
  const isSearchModeOpen = search.isOpen && isSearchMode;
  const keyboardInset = useKeyboardInset(isSearchModeOpen);
  const dropDownPresence = usePresence(isDropDownOpen, MOTION.DROP_DOWN_MS);
  const searchModePresence = usePresence(isSearchModeOpen, MOTION.SEARCH_EXIT_MS);

  const hasValue = search.selectedOption !== null;
  const isValueClearShown = isClearable && !disabled && hasValue;
  const selectedLabel = search.selectedOption?.label ?? "";
  const isQueryClearShown = isClearable && search.query !== "";
  const fieldValue = isDropDownOpen ? search.query : selectedLabel;
  const searchPlaceholder = search.selectedOption?.label ?? placeholder;
  const fieldPlaceholder = isDropDownOpen ? searchPlaceholder : placeholder;
  const activeOptionId = search.activeOption
    ? getOptionId(listId, search.activeOption.value)
    : null;

  const comboboxAriaProps = getComboboxAriaProps({
    listId,
    hintId,
    required,
    activeOptionId,
    hasHint: Boolean(hint),
    isOpen: search.isOpen,
  });

  const handleClickAway = (): void => {
    if (!isDropDownOpen) {
      return;
    }

    search.closeSearch();
  };

  const optionList = (
    <OptionList
      value={value}
      listId={listId}
      colors={palette}
      query={search.query}
      emptyText={emptyText}
      isLoading={isLoading}
      listRef={search.listRef}
      isEmpty={search.isEmpty}
      loadingText={loadingText}
      onSelect={search.selectOption}
      maxVisibleRows={maxVisibleRows}
      options={search.visibleOptions}
      activeIndex={search.activeIndex}
      onActivate={search.setActiveIndex}
      onScroll={search.handleListScroll}
      isMatchHighlighted={isMatchHighlighted}
    />
  );

  const searchModeField = (
    <SearchField
      colors={palette}
      hasShadow={hasShadow}
      startIcon={startIcon}
      clearLabel={clearLabel}
      onClear={search.clearQuery}
      isClearShown={isQueryClearShown}
      isSearchIconShown={isSearchIconShown}
    >
      <InputBase
        autoFocus
        sx={styles.input}
        id={searchInputId}
        disabled={disabled}
        value={search.query}
        onChange={search.typeQuery}
        placeholder={searchPlaceholder}
        onKeyDown={search.handleKeyDown}
        inputRef={search.searchInputRef}
        inputProps={{ ...comboboxAriaProps, "aria-label": label ?? placeholder }}
      />
    </SearchField>
  );

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={styles.root}>
        {label && (
          <Box component="label" htmlFor={inputId} sx={styles.label}>
            {label}
            {required && (
              <Box component="em" sx={styles.required}>
                *
              </Box>
            )}
          </Box>
        )}
        <SearchField
          colors={palette}
          hasShadow={hasShadow}
          startIcon={startIcon}
          clearLabel={clearLabel}
          onClear={search.clearValue}
          isClearShown={isValueClearShown}
          isSearchIconShown={isSearchIconShown}
        >
          <InputBase
            id={inputId}
            value={fieldValue}
            disabled={disabled}
            inputRef={search.inputRef}
            onClick={search.openSearch}
            onChange={search.typeQuery}
            placeholder={fieldPlaceholder}
            inputProps={comboboxAriaProps}
            onKeyDown={search.handleKeyDown}
            readOnly={isSearchMode || isInputReadOnly}
            sx={[styles.input, hasValue && styles.selectedInput]}
          />
        </SearchField>
        {dropDownPresence.isDisplayed && (
          <Box sx={[styles.dropDown, dropDownPresence.isExiting && styles.dropDownExit]}>
            {optionList}
          </Box>
        )}
        {searchModePresence.isDisplayed && (
          <SearchModeOverlay
            label={label}
            colors={palette}
            hasShadow={hasShadow}
            cancelText={cancelText}
            field={searchModeField}
            labelFor={searchInputId}
            onClose={search.closeSearch}
            keyboardInset={keyboardInset}
            container={searchModeContainer}
            isExiting={searchModePresence.isExiting}
          >
            {optionList}
          </SearchModeOverlay>
        )}
        {hint && (
          <Box id={hintId} component="p" sx={styles.hint}>
            {hint}
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default Autocomplete;
