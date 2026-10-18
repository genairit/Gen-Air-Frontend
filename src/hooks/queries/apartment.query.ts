import { QUERY_KEYS } from "../../constants/query-key.constant";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apartmentService } from "../../services/apartment.service";
import type { IApiApartmentPage } from "../../interfaces/api.interface";
import type { IApartmentQuery } from "../../interfaces/api-request.interface";

const FIRST_PAGE_CURSOR: string | null = null;

const getNextCursor = (page: IApiApartmentPage) => page.nextCursor;

export const useApartmentPagesQuery = (buildingId: string, query: IApartmentQuery) =>
  useInfiniteQuery({
    getNextPageParam: getNextCursor,
    initialPageParam: FIRST_PAGE_CURSOR,
    queryKey: QUERY_KEYS.apartments(buildingId, query),
    queryFn: ({ pageParam }) =>
      apartmentService.getPage({ buildingId, query, batchCursor: pageParam }),
  });

export const useAllApartmentsQuery = (buildingId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.allApartments(buildingId),
    queryFn: () => apartmentService.getAll(buildingId),
  });

export const useApartmentStageCountsQuery = (buildingId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.apartmentStageCounts(buildingId),
    queryFn: () => apartmentService.getStageCounts(buildingId),
  });
