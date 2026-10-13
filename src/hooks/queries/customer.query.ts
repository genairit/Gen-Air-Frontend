import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../constants/query-key.constant";
import { customerService } from "../../services/customer.service";
import type { ICustomerQuery } from "../../interfaces/api-request.interface";

export const useCustomersQuery = (query: ICustomerQuery) =>
  useQuery({
    queryKey: QUERY_KEYS.customers(query),
    queryFn: () => customerService.getByFilter(query),
  });

export const useCustomerSyncStatusCountsQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.CUSTOMER_SYNC_STATUS_COUNTS,
    queryFn: () => customerService.getSyncStatusCounts(),
  });

export const useCustomerQuery = (customerId: string | null) =>
  useQuery({
    enabled: Boolean(customerId),
    queryKey: QUERY_KEYS.customer(customerId ?? ""),
    queryFn: () => customerService.getById(customerId ?? ""),
  });
