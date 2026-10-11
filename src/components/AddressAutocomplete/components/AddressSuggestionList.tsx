import {
  PROJECT_ADDRESS_COPY,
  SUGGESTION_LIST_STATES,
  type SuggestionListStateType,
} from "../../../constants/project-address.constant";

import Icon from "../../Icon/Icon";
import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "../AddressAutocomplete.style";
import { theme } from "../../../constants/theme.constants";
import { ICON_NAMES } from "../../../constants/icon.constant";
import type { IApiPlaceSuggestion } from "../../../interfaces/api.interface";

interface IAddressSuggestionListProps {
  listId: string;
  activeIndex: number;
  state: SuggestionListStateType;
  onSelect: (index: number) => void;
  suggestions: IApiPlaceSuggestion[];
  getOptionId: (index: number) => string;
}

const AddressSuggestionList: FC<IAddressSuggestionListProps> = ({
  state,
  listId,
  onSelect,
  activeIndex,
  suggestions,
  getOptionId,
}) => {
  const styles = useStyles();

  const renderMessage = (message: string) => (
    <Box component="li" role="presentation" sx={styles.listMessage}>
      {message}
    </Box>
  );

  const renderSuggestion = (suggestion: IApiPlaceSuggestion, index: number) => (
    <Box
      role="option"
      component="li"
      id={getOptionId(index)}
      key={suggestion.placeId}
      onClick={() => onSelect(index)}
      aria-selected={index === activeIndex}
      sx={styles.suggestion(index === activeIndex)}
      onMouseDown={event => event.preventDefault()}
    >
      <Icon size={22} name={ICON_NAMES.LOCATION} color={theme.palette.primary} />
      <Box sx={styles.suggestionText}>
        <Box component="b" sx={styles.suggestionMain}>
          {suggestion.mainText}
        </Box>
        {suggestion.secondaryText && (
          <Box component="span" sx={styles.suggestionSecondary}>
            {suggestion.secondaryText}
          </Box>
        )}
      </Box>
    </Box>
  );

  const CONTENT_BY_STATE: Record<SuggestionListStateType, () => ReactNode> = {
    [SUGGESTION_LIST_STATES.RESULTS]: () => suggestions.map(renderSuggestion),
    [SUGGESTION_LIST_STATES.EMPTY]: () => renderMessage(PROJECT_ADDRESS_COPY.NO_RESULTS),
    [SUGGESTION_LIST_STATES.LOADING]: () => renderMessage(PROJECT_ADDRESS_COPY.LOADING),
    [SUGGESTION_LIST_STATES.ERROR]: () => renderMessage(PROJECT_ADDRESS_COPY.SEARCH_FAILED),
  };

  return (
    <Box id={listId} role="listbox" component="ul" sx={styles.suggestions}>
      {CONTENT_BY_STATE[state]()}
      <Box component="li" role="presentation" sx={styles.listFooter}>
        <span>{PROJECT_ADDRESS_COPY.LIST_FOOTER}</span>
        <span>{PROJECT_ADDRESS_COPY.SOURCE}</span>
      </Box>
    </Box>
  );
};

export default AddressSuggestionList;
