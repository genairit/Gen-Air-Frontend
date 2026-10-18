import {
  getAddressCityLine,
  getAddressTypingHint,
  formatSuggestionLabel,
  getAddressFieldStatus,
  getSuggestionListState,
  getAddressFailureTitle,
} from "../../utilities/address.utility";

import {
  ADDRESS_SEARCH,
  PROJECT_ADDRESS_COPY,
  ADDRESS_FIELD_STATUSES,
} from "../../constants/project-address.constant";

import Icon from "../Icon/Icon";
import { Box } from "@mui/material";
import FieldLabel from "../FieldLabel/FieldLabel";
import { useStyles } from "./AddressAutocomplete.style";
import { theme } from "../../constants/theme.constants";
import { type FC, useId, useRef, useState } from "react";
import { ICON_NAMES } from "../../constants/icon.constant";
import AddressStatusPanel from "./components/AddressStatusPanel";
import { useSessionToken } from "../../hooks/session-token.hook";
import { useListNavigation } from "../../hooks/list-navigation.hook";
import { useDebouncedValue } from "../../hooks/debounced-value.hook";
import AddressSuggestionList from "./components/AddressSuggestionList";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import AddressStatusAdornment from "./components/AddressStatusAdornment";
import type { IVerifiedAddress } from "../../interfaces/project.interface";
import { useAddressSuggestionsQuery } from "../../hooks/queries/address.query";
import { useVerifyAddressMutation } from "../../hooks/mutations/address.mutation";

interface IAddressAutocompleteProps {
  title: string;
  requiresCity: boolean;
  showMissingError: boolean;
  value: IVerifiedAddress | null;
  onChange: (address: IVerifiedAddress | null) => void;
}

const AddressAutocomplete: FC<IAddressAutocompleteProps> = ({
  title,
  value,
  onChange,
  requiresCity,
  showMissingError,
}) => {
  const listId = useId();
  const styles = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);
  const { sessionToken, renewSessionToken } = useSessionToken();
  const [isFocused, setIsFocused] = useState(false);
  const [input, setInput] = useState(value?.formattedAddress ?? "");
  const [lookupError, setLookupError] = useState<string | null>(null);

  const searchInput = useDebouncedValue(input.trim(), ADDRESS_SEARCH.DEBOUNCE_MS);
  const verifyMutation = useVerifyAddressMutation();

  const fieldState = {
    input,
    isFocused,
    lookupError,
    requiresCity,
    address: value,
    showMissingError,
    isConfirming: verifyMutation.isPending,
  };

  const status = getAddressFieldStatus(fieldState);
  const isDebouncing = input.trim() !== searchInput;
  const isSuggestionsOpen = status === ADDRESS_FIELD_STATUSES.SUGGESTIONS;

  const suggestionsQuery = useAddressSuggestionsQuery({
    sessionToken,
    input: searchInput,
    isEnabled: isSuggestionsOpen && !isDebouncing,
  });

  const suggestions = suggestionsQuery.data ?? [];
  const getOptionId = (index: number) => `${listId}-option-${index}`;

  const listState = getSuggestionListState({
    suggestions,
    isError: suggestionsQuery.isError,
    isLoading: suggestionsQuery.isFetching || isDebouncing,
  });

  const confirmAddress = (address: IVerifiedAddress) => {
    onChange(address);
    setInput(address.formattedAddress);
    renewSessionToken();
  };

  const selectSuggestion = (index: number) => {
    const suggestion = suggestions[index] ?? null;

    if (!suggestion) {
      return;
    }

    setLookupError(null);
    setInput(formatSuggestionLabel(suggestion));
    inputRef.current?.blur();
    verifyMutation.mutate(
      { sessionToken, placeId: suggestion.placeId },
      {
        onSuccess: confirmAddress,
        onError: error => setLookupError(getApiErrorMessage(error)),
      },
    );
  };

  const { activeIndex, handleKeyDown, resetActiveIndex } = useListNavigation({
    isEnabled: isFocused,
    onSelect: selectSuggestion,
    itemCount: suggestions.length,
    onEscape: () => inputRef.current?.blur(),
  });

  const handleInputChange = (nextInput: string) => {
    setInput(nextInput);
    setLookupError(null);
    resetActiveIndex();

    if (value) {
      onChange(null);
    }
  };

  const handleChangeAddress = () => {
    handleInputChange("");
    inputRef.current?.focus();
  };

  return (
    <Box sx={styles.container}>
      <FieldLabel isRequired title={title} />
      <Box sx={styles.field(status)}>
        <Icon name={ICON_NAMES.LOCATION} color={theme.palette.primary} />
        <Box
          value={input}
          ref={inputRef}
          role="combobox"
          component="input"
          sx={styles.input}
          aria-label={title}
          autoComplete="off"
          aria-controls={listId}
          aria-autocomplete="list"
          onKeyDown={handleKeyDown}
          aria-expanded={isSuggestionsOpen}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          placeholder={PROJECT_ADDRESS_COPY.PLACEHOLDER}
          onChange={event => handleInputChange(event.target.value)}
          aria-activedescendant={isSuggestionsOpen ? getOptionId(activeIndex) : ""}
        />
        <AddressStatusAdornment
          status={status}
          isConfirming={verifyMutation.isPending}
          typingHint={getAddressTypingHint(input)}
        />
      </Box>
      {isSuggestionsOpen && (
        <AddressSuggestionList
          listId={listId}
          state={listState}
          activeIndex={activeIndex}
          suggestions={suggestions}
          getOptionId={getOptionId}
          onSelect={selectSuggestion}
        />
      )}
      <AddressStatusPanel
        status={status}
        onChange={handleChangeAddress}
        cityLine={getAddressCityLine(value)}
        onRetry={() => inputRef.current?.focus()}
        formattedAddress={value?.formattedAddress ?? ""}
        failureTitle={getAddressFailureTitle(fieldState)}
      />
    </Box>
  );
};

export default AddressAutocomplete;
