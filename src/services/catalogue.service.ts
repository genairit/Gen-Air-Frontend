import type {
  TCatalogueCreate,
  TCatalogueItemChanges,
  ICatalogueDirectoryQuery,
} from "../interfaces/catalogue.interface";

import { API_ENDPOINTS } from "../constants/api.constant";
import { isCursorPageOf } from "../utilities/guards/api.guard";
import { httpClient, ensureResponse } from "./http-client.service";
import { isCatalogueItem } from "../utilities/guards/quotation.guard";

export const catalogueService = {
  async list(filters: ICatalogueDirectoryQuery, cursor: string | null, signal: AbortSignal) {
    const endpoint = filters.canManage
      ? API_ENDPOINTS.CATALOGUE_MAINTENANCE
      : API_ENDPOINTS.CATALOGUE_DIRECTORY;
    const response = await httpClient.get<unknown>(endpoint, {
      signal,
      params: {
        search: filters.search,
        batchCursor: cursor,
        pricedOnly: filters.pricedOnly,
        excludeArchived: filters.canManage || undefined,
      },
    });
    return ensureResponse(endpoint, response.data, isCursorPageOf(isCatalogueItem));
  },
  async create(input: TCatalogueCreate) {
    const endpoint = API_ENDPOINTS.CATALOGUE;
    const response = await httpClient.post<unknown>(endpoint, input);
    return ensureResponse(endpoint, response.data, isCatalogueItem);
  },
  async update(id: string, input: Partial<TCatalogueItemChanges & { status: string }>) {
    const endpoint = API_ENDPOINTS.catalogueById(id);
    const response = await httpClient.patch<unknown>(endpoint, input);
    return ensureResponse(endpoint, response.data, isCatalogueItem);
  },
};
