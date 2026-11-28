import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "./debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../constants/search.constant";
import { validEstimateDraft } from "../utilities/estimate-draft.utility";
import { engineeringEstimateService } from "../services/engineering-estimate.service";
import type { IEstimateCalculation } from "../interfaces/engineering-estimate.interface";

export const useEstimatePreview = (input: IEstimateCalculation, enabled: boolean) => {
  const serialized = JSON.stringify(input);
  const debounced = useDebouncedValue(serialized, SEARCH_DEBOUNCE_MS);
  const valid = validEstimateDraft(input.areas);
  const ready = serialized === debounced && valid;
  const query = useQuery({
    queryKey: ["estimate-preview", input],
    queryFn: () => engineeringEstimateService.preview(input),
    enabled: enabled && ready,
    retry: false,
  });
  return { ...query, waiting: enabled && valid && (!ready || query.isFetching) };
};
