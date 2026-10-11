import { QUERY_KEYS } from "../../constants/query-key.constant";
import { addressService } from "../../services/address.service";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ADDRESS_SEARCH } from "../../constants/project-address.constant";

interface IAddressSuggestionsQuery {
  input: string;
  isEnabled: boolean;
  sessionToken: string;
}

export const useAddressSuggestionsQuery = ({
  input,
  isEnabled,
  sessionToken,
}: IAddressSuggestionsQuery) =>
  useQuery({
    retry: false,
    placeholderData: keepPreviousData,
    enabled: isEnabled && input.length >= ADDRESS_SEARCH.MIN_CHARACTERS,
    queryKey: QUERY_KEYS.addressSuggestions(input, sessionToken),
    queryFn: ({ signal }) => addressService.getSuggestions({ input, signal, sessionToken }),
  });
