import { API_ENDPOINTS } from "../constants/api.constant";
import { httpClient, ensureResponse } from "./http-client.service";
import { isCustomerProjectPage } from "../utilities/guards/customer-project.guard";
import { CUSTOMER_PROJECT_PAGINATION } from "../constants/customer-project.constant";
import type { ICustomerProjectQuery } from "../interfaces/customer-project.interface";

class CustomerProjectService {
  async getPage(customerId: string, query: ICustomerProjectQuery, batchCursor: string | null) {
    const endpoint = API_ENDPOINTS.customerProjects(customerId);
    const batchSize = batchCursor
      ? CUSTOMER_PROJECT_PAGINATION.NEXT_SIZE
      : CUSTOMER_PROJECT_PAGINATION.INITIAL_SIZE;
    const response = await httpClient.get<unknown>(endpoint, {
      params: {
        search: query.search.trim() || null,
        stageId: query.stageId,
        batchCursor,
        batchSize,
      },
    });

    return ensureResponse(endpoint, response.data, isCustomerProjectPage);
  }
}

export const customerProjectService = new CustomerProjectService();
