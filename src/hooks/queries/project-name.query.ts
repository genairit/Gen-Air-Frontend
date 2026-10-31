import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "../debounced-value.hook";
import { QUERY_ROOTS } from "../../constants/query-key.constant";
import { SEARCH_DEBOUNCE_MS } from "../../constants/search.constant";
import { getProjectNameAvailability } from "../../services/project-name.service";

export const useProjectNameAvailability = (name: string, excludeId: string | null) => {
  const normalizedName = name.trim();
  const debouncedName = useDebouncedValue(normalizedName, SEARCH_DEBOUNCE_MS);
  const query = useQuery({
    retry: false,
    enabled: debouncedName !== "",
    queryKey: [QUERY_ROOTS.PROJECT_NAME_AVAILABILITY, debouncedName, excludeId],
    queryFn: ({ signal }) => getProjectNameAvailability({ name: debouncedName, excludeId, signal }),
  });
  const isPending = normalizedName !== "" && (normalizedName !== debouncedName || query.isPending);
  const isCurrent = normalizedName === debouncedName;

  return {
    retry: () => query.refetch(),
    isPending,
    isError: isCurrent && query.isError,
    isTaken: isCurrent && query.data === false,
  };
};
