import { useSessionUser } from "../store/session.store";
import type { ICursorPage } from "../interfaces/api.interface";
import { catalogueService } from "../services/catalogue.service";
import { quotationService } from "../services/quotation.service";
import type { ICatalogueItem } from "../interfaces/quotation.interface";
import { QUOTATION_CATALOGUE_KEY } from "../constants/quotation.constant";
import type { ICatalogueDirectoryQuery } from "../interfaces/catalogue.interface";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const CATALOGUE_KEY = "catalogue-directory";
const detailKey = (id: string | null, roleContext: unknown[]) =>
  [CATALOGUE_KEY, "item", id, ...roleContext] as const;
const useCatalogueRoleContext = () => {
  const user = useSessionUser();
  return [user?.id, user?.role];
};

export const useCatalogueDirectory = (filters: ICatalogueDirectoryQuery) => {
  const roleContext = useCatalogueRoleContext();
  return useInfiniteQuery({
    queryKey: [CATALOGUE_KEY, "list", ...roleContext, filters],
    initialPageParam: null as string | null,
    getNextPageParam: (page: ICursorPage<ICatalogueItem>) => page.nextCursor,
    queryFn: ({ pageParam, signal }) => catalogueService.list(filters, pageParam, signal),
  });
};

export const useCatalogueItem = (id: string | null) => {
  const roleContext = useCatalogueRoleContext();
  return useQuery({
    enabled: id !== null,
    queryKey: detailKey(id, roleContext),
    queryFn: () => quotationService.catalogueItem(id ?? ""),
  });
};

export const useCatalogueMutation = <T>(
  mutationFn: (input: T) => ReturnType<typeof catalogueService.create>,
) => {
  const roleContext = useCatalogueRoleContext();
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async item => {
      client.setQueryData(detailKey(item.id, roleContext), item);
      await Promise.all([
        client.invalidateQueries({ queryKey: [CATALOGUE_KEY, "list"] }),
        client.invalidateQueries({ queryKey: [QUOTATION_CATALOGUE_KEY] }),
      ]);
    },
  });
};
