import {
  QUOTATION_PROJECTS_KEY,
  QUOTATION_CATALOGUE_KEY,
  QUOTATION_SALES_AGENTS_KEY,
} from "../../constants/quotation.constant";

import type {
  ICatalogueItem,
  IQuotationSalesAgent,
  IQuotationProjectChoice,
  IProjectQuotationPage,
} from "../../interfaces/quotation.interface";

import { useSessionUser } from "../../store/session.store";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { PERMISSIONS } from "../../constants/permission.constant";
import { hasPermission } from "../../utilities/permission.utility";
import { quotationService } from "../../services/quotation.service";
import { QUOTATION_SHARING_KEYS } from "../../constants/quotation-sharing.constant";

export const useQuotationCatalogueQuery = (
  query: { [parameter: string]: string | number },
  enabled: boolean,
): UseQueryResult<ICatalogueItem[], Error> => {
  const user = useSessionUser();
  return useQuery({
    queryKey: [QUOTATION_CATALOGUE_KEY, user?.id ?? null, query],
    queryFn: () => quotationService.catalogue(query),
    enabled,
  });
};
export const useQuotationProjectChoices = (
  customerId: string,
  search: string,
): UseQueryResult<IQuotationProjectChoice[], Error> =>
  useQuery({
    queryKey: [QUOTATION_PROJECTS_KEY, customerId, search],
    queryFn: () => quotationService.projectChoices(customerId, search),
  });
export const useQuotationApartmentOptionsQuery = (quotationId: string, enabled: boolean) =>
  useQuery({
    enabled,
    queryKey: QUOTATION_SHARING_KEYS.apartmentOptions(quotationId),
    queryFn: () => quotationService.apartmentOptions(quotationId),
  });
export const useProjectQuotationsQuery = (projectId: string) =>
  useInfiniteQuery({
    initialPageParam: null as string | null,
    getNextPageParam: (page: IProjectQuotationPage) => page.nextCursor,
    queryKey: QUOTATION_SHARING_KEYS.projectQuotations(projectId),
    queryFn: ({ pageParam }) => quotationService.projectQuotations(projectId, pageParam),
  });
export const useQuotationSalesAgentsQuery = (): UseQueryResult<IQuotationSalesAgent[], Error> => {
  const user = useSessionUser();
  return useQuery({
    queryKey: [...QUOTATION_SALES_AGENTS_KEY, user?.id ?? null],
    queryFn: quotationService.salesAgents,
    enabled:
      hasPermission(user, PERMISSIONS.QUOTATIONS_READ) &&
      hasPermission(user, PERMISSIONS.EMPLOYEES_READ),
  });
};
