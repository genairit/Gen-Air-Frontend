import {
  type IOptionListProps,
  type IAutocompleteOption,
} from "../../../../interfaces/autocomplete.interface";

import { type FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./OptionList.style";
import MatchedText from "../MatchedText/MatchedText";
import CheckMarkIcon from "../../../../icons/CheckMarkIcon";
import { getListMaxHeight, getOptionId } from "../../utilities/autocomplete.utility";

const OptionList: FC<IOptionListProps> = ({
  query,
  value,
  colors,
  listId,
  listRef,
  isEmpty,
  options,
  onSelect,
  onScroll,
  emptyText,
  isLoading,
  onActivate,
  activeIndex,
  loadingText,
  maxVisibleRows,
  isMatchHighlighted,
}) => {
  const styles = useStyles(colors, getListMaxHeight(maxVisibleRows));

  const renderOption = (option: IAutocompleteOption, index: number) => {
    const isActive = index === activeIndex;
    const isSelected = option.value === value;

    return (
      <Box
        role="option"
        key={option.value}
        aria-selected={isSelected}
        onClick={() => onSelect(option)}
        id={getOptionId(listId, option.value)}
        onMouseEnter={() => onActivate(index)}
        sx={[styles.option, isActive && styles.activeOption]}
      >
        <Box component="span" sx={styles.optionText}>
          <MatchedText query={query} text={option.label} isHighlighted={isMatchHighlighted} />
        </Box>
        {option.subtitle && (
          <Box component="span" sx={styles.optionSubtitle}>
            <MatchedText query={query} text={option.subtitle} isHighlighted={isMatchHighlighted} />
          </Box>
        )}
        {option.helperText && (
          <Box component="span" sx={styles.optionHelperText(option.helperTextColor)}>
            {option.helperText}
          </Box>
        )}
        {isSelected && <CheckMarkIcon sx={styles.optionCheck} />}
      </Box>
    );
  };

  return (
    <Box
      id={listId}
      ref={listRef}
      role="listbox"
      sx={styles.list}
      onScroll={onScroll}
      aria-busy={isLoading}
    >
      {isEmpty && (
        <Box role="option" aria-disabled aria-selected={false} sx={styles.statusRow}>
          {emptyText}
        </Box>
      )}
      {options.map(renderOption)}
      {isLoading && (
        <Box
          role="option"
          aria-disabled
          aria-selected={false}
          sx={[styles.statusRow, styles.loadingRow]}
        >
          <Box aria-hidden sx={styles.spinner} />
          {loadingText}
        </Box>
      )}
    </Box>
  );
};

export default OptionList;
