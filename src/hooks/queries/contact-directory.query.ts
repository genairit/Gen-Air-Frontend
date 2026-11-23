import type {
  IContactDirectorySearchResult,
  IContactDirectorySearchOptions,
} from "../../interfaces/contact-directory-search.interface";

import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "../debounced-value.hook";
import { QUERY_KEYS } from "../../constants/query-key.constant";
import { SEARCH_DEBOUNCE_MS } from "../../constants/search.constant";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { contactDirectoryService } from "../../services/contact-directory.service";

export const useContactDirectorySearch = ({
  search,
  enabled = true,
}: IContactDirectorySearchOptions): IContactDirectorySearchResult => {
  const normalizedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(normalizedSearch, SEARCH_DEBOUNCE_MS);
  const hasQuery = normalizedSearch.length > 0;
  const isCurrentQuery = normalizedSearch === debouncedSearch;
  const canSearch = enabled && hasQuery && isCurrentQuery;
  const query = useQuery({
    enabled: canSearch,
    queryKey: QUERY_KEYS.contactDirectory(normalizedSearch),
    queryFn: ({ signal }) => contactDirectoryService.search(normalizedSearch, signal),
  });
  const isReady = canSearch && query.isSuccess;
  const isLoading = enabled && hasQuery && (!isCurrentQuery || query.isFetching);
  const hasCurrentError = canSearch && query.isError;
  const errorMessage = hasCurrentError ? getApiErrorMessage(query.error) : null;
  const contacts = isReady ? (query.data ?? []) : [];
  const showPrompt = enabled && !hasQuery;
  const refresh = async (): Promise<void> => {
    if (!canSearch) {
      return;
    }

    await query.refetch();
  };

  return { contacts, isReady, isLoading, hasQuery, showPrompt, errorMessage, refresh };
};
