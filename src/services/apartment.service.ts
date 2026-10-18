import {
  isApiProject,
  isApiApartmentPage,
  isProjectStageCounts,
} from "../utilities/guards/api.guard";

import type {
  IApartmentQuery,
  IApartmentChanges,
  IApartmentPayload,
} from "../interfaces/api-request.interface";

import { httpClient, ensureResponse } from "./http-client.service";
import { API_ENDPOINTS, API_PAGE_SIZE } from "../constants/api.constant";

interface IApartmentPageRequest {
  buildingId: string;
  query: IApartmentQuery;
  batchCursor: string | null;
}

class ApartmentService {
  async getPage({ buildingId, query, batchCursor }: IApartmentPageRequest) {
    const endpoint = API_ENDPOINTS.projectApartments(buildingId);
    const response = await httpClient.get<unknown>(endpoint, {
      params: { search: query.search.trim() || null, stageId: query.stageId, batchCursor },
    });

    return ensureResponse(endpoint, response.data, isApiApartmentPage);
  }

  async getAll(buildingId: string) {
    const endpoint = API_ENDPOINTS.projectApartments(buildingId);
    const response = await httpClient.get<unknown>(endpoint, {
      params: { batchSize: API_PAGE_SIZE },
    });

    return ensureResponse(endpoint, response.data, isApiApartmentPage).items;
  }

  async getStageCounts(buildingId: string) {
    const endpoint = API_ENDPOINTS.apartmentStageCounts(buildingId);
    const response = await httpClient.get<unknown>(endpoint);

    return ensureResponse(endpoint, response.data, isProjectStageCounts);
  }

  async create(buildingId: string, payload: IApartmentPayload) {
    const endpoint = API_ENDPOINTS.projectApartments(buildingId);
    const response = await httpClient.post<unknown>(endpoint, payload);

    return ensureResponse(endpoint, response.data, isApiProject);
  }

  async update(apartmentId: string, changes: IApartmentChanges) {
    const endpoint = API_ENDPOINTS.projectById(apartmentId);
    const response = await httpClient.patch<unknown>(endpoint, changes);

    return ensureResponse(endpoint, response.data, isApiProject);
  }
}

export const apartmentService = new ApartmentService();
