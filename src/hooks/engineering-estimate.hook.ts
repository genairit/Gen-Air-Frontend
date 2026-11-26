import {
  useQuery,
  useMutation,
  useIsMutating,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

import type {
  IEstimatePage,
  IEngineeringEstimate,
} from "../interfaces/engineering-estimate.interface";

import { isAxiosError } from "axios";
import { HTTP_STATUS } from "../constants/api.constant";
import { getApiErrorMessage } from "../utilities/api-error.utility";
import { ESTIMATE_QUERY_KEY } from "../constants/engineering-estimate.constant";
import { engineeringEstimateService } from "../services/engineering-estimate.service";
import { EstimateDocumentError } from "../services/engineering-estimate-document.service";

const FIRST_ESTIMATE_CURSOR: string | null = null;
const listKey = [ESTIMATE_QUERY_KEY, "list"];
const commandKey = (id: string): string[] => [ESTIMATE_QUERY_KEY, "command", id];
const detailKey = (id: string): string[] => [ESTIMATE_QUERY_KEY, "detail", id];

export const useEstimatesQuery = () =>
  useInfiniteQuery({
    queryKey: listKey,
    initialPageParam: FIRST_ESTIMATE_CURSOR,
    getNextPageParam: (page: IEstimatePage): string | null => page.nextCursor,
    queryFn: ({ pageParam }) => engineeringEstimateService.list(pageParam),
  });

export const useEstimateQuery = (id: string | null) =>
  useQuery({
    enabled: id !== null,
    queryKey: detailKey(id ?? ""),
    queryFn: (): Promise<IEngineeringEstimate> => engineeringEstimateService.get(id ?? ""),
  });

export const useCreateEstimate = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: engineeringEstimateService.create,
    onSuccess: async (estimate): Promise<void> => {
      client.setQueryData(detailKey(estimate.id), estimate);
      await client.invalidateQueries({ queryKey: listKey });
    },
  });
};

export const useEstimateCommand = (id: string) => {
  const client = useQueryClient();
  const mutationKey = commandKey(id);
  const isPending = useIsMutating({ mutationKey }) > 0;
  const refresh = async (): Promise<void> => {
    await Promise.all([
      client.invalidateQueries({ queryKey: detailKey(id) }),
      client.invalidateQueries({ queryKey: listKey }),
    ]);
  };
  const mutation = useMutation({
    mutationKey,
    mutationFn: async (command: () => Promise<void>): Promise<void> => command(),
    onSuccess: refresh,
    onError: async (error): Promise<void> => {
      if (isEstimateConflict(error)) {
        await refresh();
      }
    },
  });
  return { ...mutation, isPending };
};

const isEstimateConflict = (error: unknown): boolean =>
  (isAxiosError(error) && error.response?.status === HTTP_STATUS.CONFLICT) ||
  (error instanceof EstimateDocumentError && error.status === HTTP_STATUS.CONFLICT);

export const getEstimateCommandErrorMessage = (error: unknown): string => {
  const message =
    error instanceof EstimateDocumentError ? error.message : getApiErrorMessage(error);
  if (isEstimateConflict(error)) {
    return `${message} בדקו את הנתונים המעודכנים לפני ניסיון נוסף.`;
  }

  return message;
};
