import type {
  IQuotationPublication,
  IQuotationPublicationRetry,
} from "../interfaces/quotation-publication.interface";

import { API_ENDPOINTS } from "../constants/api.constant";
import { httpClient, ensureResponse } from "./http-client.service";
import { isQuotationPublication } from "../utilities/guards/quotation-publication.guard";

export const quotationPublicationService = {
  async get(id: string): Promise<IQuotationPublication> {
    const endpoint = `${API_ENDPOINTS.quotationById(id)}/publication`;
    const response = await httpClient.get<unknown>(endpoint);
    return ensureResponse(endpoint, response.data, isQuotationPublication);
  },
  async retry(id: string, input: IQuotationPublicationRetry): Promise<IQuotationPublication> {
    const endpoint = `${API_ENDPOINTS.quotationById(id)}/publication/retry`;
    const response = await httpClient.post<unknown>(endpoint, input);
    return ensureResponse(endpoint, response.data, isQuotationPublication);
  },
};
