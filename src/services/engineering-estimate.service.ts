import type {
  TEstimatePatch,
  IEstimateCreate,
  IEstimateSample,
  IEngineeringEstimate,
} from "../interfaces/engineering-estimate.interface";

import { httpClient, ensureResponse } from "./http-client.service";
import { ESTIMATE_ENDPOINT } from "../constants/engineering-estimate.constant";
import {
  areEngineeringEstimates,
  isEngineeringEstimate,
  isEstimateQuotation,
} from "../utilities/guards/engineering-estimate.guard";

const detail = (id: string): string => `${ESTIMATE_ENDPOINT}/${encodeURIComponent(id)}`;

export const engineeringEstimateService = {
  list: async (): Promise<IEngineeringEstimate[]> => {
    const response = await httpClient.get<unknown>(ESTIMATE_ENDPOINT);
    return ensureResponse(ESTIMATE_ENDPOINT, response.data, areEngineeringEstimates);
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
  plan: async (id: string, planId: string): Promise<Blob> =>
    (
      await httpClient.get<Blob>(`${detail(id)}/plans/${encodeURIComponent(planId)}`, {
        responseType: "blob",
      })
    ).data,
  sketch: async (id: string, version: number, samples: IEstimateSample[]): Promise<Blob> =>
    (
      await httpClient.post<Blob>(
        `${detail(id)}/sketch`,
        { version, samples },
        { responseType: "blob" },
      )
    ).data,
  downloadSketch: async (id: string): Promise<Blob> =>
    (await httpClient.get<Blob>(`${detail(id)}/sketch`, { responseType: "blob" })).data,
  approve: async (id: string, version: number): Promise<void> => {
    await httpClient.post(`${detail(id)}/approve`, { version });
  },
  proposal: async (id: string): Promise<Blob> =>
    (await httpClient.get<Blob>(`${detail(id)}/proposal`, { responseType: "blob" })).data,
  quotation: async (id: string, version: number, customerId: string | null): Promise<string> => {
    const endpoint = `${detail(id)}/quotation`;
    const response = await httpClient.post<unknown>(endpoint, {
      version,
      ...(customerId ? { customerId } : {}),
    });
    return ensureResponse(endpoint, response.data, isEstimateQuotation).quotationId;
  },
};
