import type {
  IQuotation,
  IQuotationPage,
  ICatalogueItem,
  TQuotationStatus,
  IQuotationListQuery,
  IProjectQuotationPage,
  IQuotationApartmentOptions,
  IQuotationSalesAgent,
} from "../interfaces/quotation.interface";

import {
  isQuotation,
  isQuotationPage,
  isCatalogueItem,
  isCatalogueList,
  isQuotationSalesAgent,
} from "../utilities/guards/quotation.guard";

import { API_ENDPOINTS } from "../constants/api.constant";
import { quotationPayload } from "../utilities/quotation.utility";
import { httpClient, ensureResponse } from "./http-client.service";
import { isProjectQuotationPage } from "../utilities/guards/quotation.guard";
import { isQuotationStatusCounts } from "../utilities/guards/quotation.guard";
import { isQuotationProjectChoice } from "../utilities/guards/quotation.guard";
import type { IQuotationStatusCounts } from "../interfaces/quotation.interface";
import { isRecord, isNullableString } from "../utilities/guards/primitive.guard";
import type { IQuotationProjectChoice } from "../interfaces/quotation.interface";
import { QUOTATION_SHARING_LAYOUT } from "../constants/quotation-sharing.constant";
import { isQuotationApartmentOptions } from "../utilities/guards/quotation-sharing.guard";

export const quotationService = {
  async statusCounts(search: string): Promise<IQuotationStatusCounts> {
    const endpoint = API_ENDPOINTS.QUOTATION_STATUS_COUNTS;
    const response = await httpClient.get<unknown>(endpoint, { params: { search } });
    return ensureResponse(endpoint, response.data, isQuotationStatusCounts);
  },
  async salesAgents(): Promise<IQuotationSalesAgent[]> {
    const endpoint = API_ENDPOINTS.QUOTATION_SALES_AGENTS;
    const response = await httpClient.get<unknown>(endpoint);
    const agents = response.data;
    if (!Array.isArray(agents) || !agents.every(isQuotationSalesAgent)) {
      throw new Error("רשימת סוכני המכירות אינה תקינה");
    }
    return agents;
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
  async create(input: { customerId: string; salesAgentId: string | null }): Promise<IQuotation> {
    const response = await httpClient.post<unknown>(API_ENDPOINTS.QUOTATIONS, input);
    return ensureResponse(API_ENDPOINTS.QUOTATIONS, response.data, isQuotation);
  },
  async save(quotation: IQuotation): Promise<IQuotation> {
    const endpoint = API_ENDPOINTS.quotationById(quotation.id);
    const response = await httpClient.put<unknown>(endpoint, quotationPayload(quotation));
    return ensureResponse(endpoint, response.data, isQuotation);
  },
  async updateSalesAgent(
    quotation: Pick<IQuotation, "id" | "version"> & { salesAgentId: string | null },
  ): Promise<IQuotation> {
    const endpoint = API_ENDPOINTS.quotationSalesAgent(quotation.id);
    const response = await httpClient.patch<unknown>(endpoint, {
      version: quotation.version,
      salesAgentId: quotation.salesAgentId,
    });
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
  async cancel(quotation: Pick<IQuotation, "id" | "version">, reason: string): Promise<IQuotation> {
    const endpoint = API_ENDPOINTS.quotationCancel(quotation.id);
    const response = await httpClient.post<unknown>(endpoint, {
      version: quotation.version,
      reason,
    });
    return ensureResponse(endpoint, response.data, isQuotation);
  },
  async restore(quotation: Pick<IQuotation, "id" | "version">): Promise<IQuotation> {
    const endpoint = API_ENDPOINTS.quotationRestore(quotation.id);
    const response = await httpClient.post<unknown>(endpoint, { version: quotation.version });
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
  async apartmentOptions(quotationId: string): Promise<IQuotationApartmentOptions> {
    const endpoint = API_ENDPOINTS.quotationApartmentOptions(quotationId);
    const response = await httpClient.get<unknown>(endpoint);
    return ensureResponse(endpoint, response.data, isQuotationApartmentOptions);
  },
  async setApartmentLinks(
    quotationId: string,
    apartmentIds: string[],
    expectedApartmentIds: string[],
  ): Promise<IQuotation> {
    const endpoint = API_ENDPOINTS.quotationApartmentLinks(quotationId);
    const response = await httpClient.put<unknown>(endpoint, {
      apartmentIds,
      expectedApartmentIds,
    });
    return ensureResponse(endpoint, response.data, isQuotation);
  },
  async projectQuotations(
    projectId: string,
    batchCursor: string | null,
  ): Promise<IProjectQuotationPage> {
    const endpoint = API_ENDPOINTS.projectQuotations(projectId);
    const response = await httpClient.get<unknown>(endpoint, {
      params: { batchCursor, batchSize: QUOTATION_SHARING_LAYOUT.PROJECT_PAGE_SIZE },
    });
    return ensureResponse(endpoint, response.data, isProjectQuotationPage);
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
