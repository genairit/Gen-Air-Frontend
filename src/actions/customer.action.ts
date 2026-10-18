import { queryClient } from "../providers/query-client";
import { customerService } from "../services/customer.service";
import { QUERY_KEYS, QUERY_ROOTS } from "../constants/query-key.constant";
import type { ICreateCustomerPayload } from "../interfaces/customer.interface";

export const createCustomerAction = async (payload: ICreateCustomerPayload) => {
  const customer = await customerService.create(payload);
  queryClient.setQueryData(QUERY_KEYS.customer(customer.id), customer);
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.CUSTOMERS] }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER_SYNC_STATUS_COUNTS }),
  ]);
  return customer.id;
};
