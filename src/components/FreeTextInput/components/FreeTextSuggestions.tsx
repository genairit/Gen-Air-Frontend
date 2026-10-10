import { Box } from "@mui/material";
import { type MouseEvent } from "react";
import { useStyles } from "./FreeTextSuggestions.style";
import { getFreeTextSuggestionClassName } from "../../../utilities/free-text.utility";

interface IFreeTextSuggestionsProps {
  activeIndex: number;
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

const preventDefault = (event: MouseEvent<HTMLLIElement>): void => {
  event.preventDefault();
};

const FreeTextSuggestions = ({ onSelect, activeIndex, suggestions }: IFreeTextSuggestionsProps) => {
  const styles = useStyles();

  return (
    <Box sx={styles.suggestionsContainer}>
      <Box sx={styles.suggestionsHeader}>הצעות מאושרות</Box>

      <Box component="ul" sx={styles.suggestionsList}>
        {suggestions.map((suggestion, index) => (
          <Box
            component="li"
            key={suggestion}
            sx={styles.suggestionItem}
            onMouseDown={preventDefault}
            onClick={() => onSelect(suggestion)}
            className={getFreeTextSuggestionClassName({ index, activeIndex })}
          >
            <Box component="span" sx={styles.suggestionText}>
              {suggestion}
            </Box>

            <Box component="span" sx={styles.suggestionTag}>
              מאושרת
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default FreeTextSuggestions;
