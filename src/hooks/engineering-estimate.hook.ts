import { ESTIMATE_QUERY_KEY } from "../constants/engineering-estimate.constant";
import { engineeringEstimateService } from "../services/engineering-estimate.service";
import type { IEngineeringEstimate } from "../interfaces/engineering-estimate.interface";
import { useIsMutating, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const listKey = [ESTIMATE_QUERY_KEY, "list"];
const commandKey = (id: string): string[] => [ESTIMATE_QUERY_KEY, "command", id];
const detailKey = (id: string): string[] => [ESTIMATE_QUERY_KEY, "detail", id];

export const useEstimatesQuery = () =>
  useQuery({ queryKey: listKey, queryFn: engineeringEstimateService.list });

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
  const mutation = useMutation({
    mutationKey,
    mutationFn: async (command: () => Promise<void>): Promise<void> => command(),
    onSuccess: async (): Promise<void> => {
      await Promise.all([
        client.invalidateQueries({ queryKey: detailKey(id) }),
        client.invalidateQueries({ queryKey: listKey }),
      ]);
    },
  });
  return { ...mutation, isPending };
};
