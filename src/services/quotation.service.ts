import type {
  IQuotation,
  IQuotationPage,
  ICatalogueItem,
  TQuotationStatus,
  IQuotationListQuery,
} from "../interfaces/quotation.interface";

import {
  isQuotation,
  isQuotationPage,
  isCatalogueItem,
  isCatalogueList,
} from "../utilities/guards/quotation.guard";

import { API_ENDPOINTS } from "../constants/api.constant";
import { quotationPayload } from "../utilities/quotation.utility";
import { httpClient, ensureResponse } from "./http-client.service";
import { isQuotationStatusCounts } from "../utilities/guards/quotation.guard";
import { isQuotationProjectChoice } from "../utilities/guards/quotation.guard";
import type { IQuotationStatusCounts } from "../interfaces/quotation.interface";
import { isRecord, isNullableString } from "../utilities/guards/primitive.guard";
import type { IQuotationProjectChoice } from "../interfaces/quotation.interface";

export const quotationService = {
  async statusCounts(search: string): Promise<IQuotationStatusCounts> {
    const endpoint = API_ENDPOINTS.QUOTATION_STATUS_COUNTS;
    const response = await httpClient.get<unknown>(endpoint, { params: { search } });
    return ensureResponse(endpoint, response.data, isQuotationStatusCounts);
  },
  async projectChoices(customerId: string, search: string): Promise<IQuotationProjectChoice[]> {
    const endpoint = API_ENDPOINTS.customerProjects(customerId);
    const response = await httpClient.get<unknown>(endpoint, { params: { search, batchSize: 50 } });
    const data = response.data;
    if (
      !isRecord(data) ||
      !Array.isArray(data.items) ||
      !data.items.every(isQuotationProjectChoice) ||
      !isNullableString(data.nextCursor)
    ) {
      throw new Error("תשובת הפרויקטים אינה תקינה");
    }
    return data.items;
  },
  async list(query: IQuotationListQuery): Promise<IQuotationPage> {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.QUOTATIONS, {
      params: { ...query, batchSize: 20 },
    });
    return ensureResponse(API_ENDPOINTS.QUOTATIONS, response.data, isQuotationPage);
  },
  async get(id: string): Promise<IQuotation> {
    const endpoint = API_ENDPOINTS.quotationById(id);
    const response = await httpClient.get<unknown>(endpoint);
    return ensureResponse(endpoint, response.data, isQuotation);
  },
  async delete(quotation: Pick<IQuotation, "id" | "version">): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.quotationById(quotation.id), {
      data: { version: quotation.version },
    });
  },
  async create(customerId: string): Promise<IQuotation> {
    const response = await httpClient.post<unknown>(API_ENDPOINTS.QUOTATIONS, { customerId });
    return ensureResponse(API_ENDPOINTS.QUOTATIONS, response.data, isQuotation);
  },
  async save(quotation: IQuotation): Promise<IQuotation> {
    const endpoint = API_ENDPOINTS.quotationById(quotation.id);
    const response = await httpClient.put<unknown>(endpoint, quotationPayload(quotation));
    return ensureResponse(endpoint, response.data, isQuotation);
  },
  async transition(quotation: IQuotation, status: TQuotationStatus): Promise<IQuotation> {
    const endpoint = API_ENDPOINTS.quotationReview(quotation.id);
    const response = await httpClient.post<unknown>(endpoint, {
      version: quotation.version,
      status,
    });
    return ensureResponse(endpoint, response.data, isQuotation);
  },
  async acknowledge(quotation: IQuotation, warningKeys: string[]): Promise<IQuotation> {
    const endpoint = API_ENDPOINTS.quotationWarnings(quotation.id);
    const response = await httpClient.post<unknown>(endpoint, {
      version: quotation.version,
      warningKeys,
    });
    return ensureResponse(endpoint, response.data, isQuotation);
  },
  async catalogue(params: { [parameter: string]: string | number }): Promise<ICatalogueItem[]> {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.CATALOGUE, { params });
    return ensureResponse(API_ENDPOINTS.CATALOGUE, response.data, isCatalogueList);
  },
  async catalogueItem(id: string): Promise<ICatalogueItem> {
    const endpoint = API_ENDPOINTS.catalogueById(id);
    const response = await httpClient.get<unknown>(endpoint);
    return ensureResponse(endpoint, response.data, isCatalogueItem);
  },
};
