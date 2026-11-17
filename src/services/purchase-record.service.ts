import type {
  IPurchaseWorkspace,
  ICreatePurchaseInput,
} from "../interfaces/purchase-record.interface";

import { httpClient } from "./http-client.service";
import type { TPurchaseRecordStatus } from "../constants/purchase-record.constant";

const path = (projectId: string) => `/purchase-record/${projectId}`;

export const purchaseRecordService = {
  async workspace(
    projectId: string,
    search = "",
    cursor: string | null = null,
  ): Promise<IPurchaseWorkspace> {
    const response = await httpClient.get<IPurchaseWorkspace>(`${path(projectId)}/workspace`, {
      params: { search, ...(cursor ? { cursor } : {}) },
    });
    return response.data;
  },
  async request(projectId: string, input: ICreatePurchaseInput): Promise<IPurchaseWorkspace> {
    const response = await httpClient.post<IPurchaseWorkspace>(
      `${path(projectId)}/requests`,
      input,
    );
    return response.data;
  },
  async order(projectId: string, input: ICreatePurchaseInput): Promise<IPurchaseWorkspace> {
    const response = await httpClient.post<IPurchaseWorkspace>(`${path(projectId)}/orders`, input);
    return response.data;
  },
  async correct(
    projectId: string,
    lineId: string,
    reason: string,
    idempotencyKey: string,
  ): Promise<IPurchaseWorkspace> {
    const response = await httpClient.post<IPurchaseWorkspace>(
      `${path(projectId)}/lines/${lineId}/corrections`,
      { reason, idempotencyKey },
    );
    return response.data;
  },
  async transition(
    projectId: string,
    recordId: string,
    status: TPurchaseRecordStatus,
    input: { reason: string; supplierName?: string; orderDate?: string; idempotencyKey: string },
  ): Promise<IPurchaseWorkspace> {
    const response = await httpClient.patch<IPurchaseWorkspace>(
      `${path(projectId)}/records/${recordId}/status`,
      { status, ...input },
    );
    return response.data;
  },
};
