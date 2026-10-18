import {
  isApiCustomer,
  isCursorPageOf,
  isCustomerSyncStatusCounts,
} from "../utilities/guards/api.guard";

import { httpClient, ensureResponse } from "./http-client.service";
import { API_ENDPOINTS, API_PAGE_SIZE } from "../constants/api.constant";
import type { ICustomerQuery } from "../interfaces/api-request.interface";
import type { ICreateCustomerPayload } from "../interfaces/customer.interface";

class CustomerService {
  async create(payload: ICreateCustomerPayload) {
    const response = await httpClient.post<unknown>(API_ENDPOINTS.CUSTOMERS, payload);
    return ensureResponse(API_ENDPOINTS.CUSTOMERS, response.data, isApiCustomer);
  }

  async getByFilter({ search, prioritySyncStatus }: ICustomerQuery) {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.CUSTOMERS, {
      params: { search: search.trim() || null, prioritySyncStatus, batchSize: API_PAGE_SIZE },
    });

    return ensureResponse(API_ENDPOINTS.CUSTOMERS, response.data, isCursorPageOf(isApiCustomer))
      .items;
  }

  async getSyncStatusCounts() {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.CUSTOMER_SYNC_STATUS_COUNTS);

    return ensureResponse(
      API_ENDPOINTS.CUSTOMER_SYNC_STATUS_COUNTS,
      response.data,
      isCustomerSyncStatusCounts,
    );
  }

  async getById(customerId: string) {
    const endpoint = API_ENDPOINTS.customerById(customerId);
    const response = await httpClient.get<unknown>(endpoint);

    return ensureResponse(endpoint, response.data, isApiCustomer);
  }
}

export const customerService = new CustomerService();
