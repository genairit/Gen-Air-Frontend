import {
  receiveEstimatePdf,
  receiveEstimateDocument,
} from "./engineering-estimate-document.service";

import type {
  IEstimatePage,
  TEstimatePatch,
  IEstimateCreate,
  IEstimateSample,
  IEngineeringEstimate,
} from "../interfaces/engineering-estimate.interface";

import {
  isEstimatePage,
  isEstimateQuotation,
  isEngineeringEstimate,
} from "../utilities/guards/engineering-estimate.guard";

import { httpClient, ensureResponse } from "./http-client.service";
import { ESTIMATE_ENDPOINT } from "../constants/engineering-estimate.constant";

const detail = (id: string): string => `${ESTIMATE_ENDPOINT}/${encodeURIComponent(id)}`;

export const engineeringEstimateService = {
  list: async (batchCursor: string | null): Promise<IEstimatePage> => {
    const response = await httpClient.get<unknown>(ESTIMATE_ENDPOINT, { params: { batchCursor } });
    return ensureResponse(ESTIMATE_ENDPOINT, response.data, isEstimatePage);
  },
  get: async (id: string): Promise<IEngineeringEstimate> => {
    const endpoint = detail(id);
    const response = await httpClient.get<unknown>(endpoint);
    return ensureResponse(endpoint, response.data, isEngineeringEstimate);
  },
  create: async (input: IEstimateCreate): Promise<IEngineeringEstimate> => {
    const response = await httpClient.post<unknown>(ESTIMATE_ENDPOINT, input);
    return ensureResponse(ESTIMATE_ENDPOINT, response.data, isEngineeringEstimate);
  },
  patch: async (id: string, input: TEstimatePatch): Promise<void> => {
    await httpClient.patch(detail(id), input);
  },
  upload: async (id: string, version: number, file: File, marked: boolean): Promise<void> => {
    const data = new FormData();
    data.set("file", file);
    data.set("version", String(version));
    data.set("marked", String(marked));
    await httpClient.post(`${detail(id)}/plans`, data);
  },
  attach: async (id: string, version: number, fileId: string): Promise<void> => {
    await httpClient.post(`${detail(id)}/plans/link`, { version, fileId });
  },
  plan: (id: string, planId: string): Promise<Blob> =>
    receiveEstimateDocument(
      httpClient.get<Blob>(`${detail(id)}/plans/${encodeURIComponent(planId)}`, {
        responseType: "blob",
      }),
    ),
  sketch: (id: string, version: number, samples: IEstimateSample[]): Promise<Blob> =>
    receiveEstimatePdf(
      httpClient.post<Blob>(`${detail(id)}/sketch`, { version, samples }, { responseType: "blob" }),
    ),
  downloadSketch: (id: string): Promise<Blob> =>
    receiveEstimatePdf(httpClient.get<Blob>(`${detail(id)}/sketch`, { responseType: "blob" })),
  approve: async (id: string, version: number): Promise<void> => {
    await httpClient.post(`${detail(id)}/approve`, { version });
  },
  proposal: (id: string): Promise<Blob> =>
    receiveEstimatePdf(httpClient.get<Blob>(`${detail(id)}/proposal`, { responseType: "blob" })),
  quotation: async (id: string, version: number, customerId: string | null): Promise<string> => {
    const endpoint = `${detail(id)}/quotation`;
    const response = await httpClient.post<unknown>(endpoint, {
      version,
      ...(customerId ? { customerId } : {}),
    });
    return ensureResponse(endpoint, response.data, isEstimateQuotation).quotationId;
  },
};
