import {
  normalizeSupplierInput,
  normalizeAgreementInput,
} from "../utilities/supplier-agreement.utility";

import type {
  ISupplier,
  ISupplierInput,
  IAgreementInput,
  ISupplierAgreement,
  IAgreementRevision,
} from "../interfaces/supplier-agreement.interface";

import { httpClient } from "./http-client.service";

const root = "/supplier-agreement";
const projectPath = (projectId: string) => `${root}/projects/${projectId}/agreements`;

export const supplierAgreementService = {
  async suppliers(search = ""): Promise<ISupplier[]> {
    const response = await httpClient.get<ISupplier[]>(`${root}/suppliers`, { params: { search } });
    return response.data;
  },
  async createSupplier(input: ISupplierInput): Promise<ISupplier> {
    const response = await httpClient.post<ISupplier>(
      `${root}/suppliers`,
      normalizeSupplierInput(input),
    );
    return response.data;
  },
  async updateSupplier(id: string, input: ISupplierInput): Promise<ISupplier> {
    const response = await httpClient.patch<ISupplier>(
      `${root}/suppliers/${id}`,
      normalizeSupplierInput(input),
    );
    return response.data;
  },
  async agreements(projectId: string): Promise<ISupplierAgreement[]> {
    const response = await httpClient.get<ISupplierAgreement[]>(projectPath(projectId));
    return response.data;
  },
  async createAgreement(projectId: string, input: IAgreementInput): Promise<ISupplierAgreement> {
    const response = await httpClient.post<ISupplierAgreement>(
      projectPath(projectId),
      normalizeAgreementInput(input),
    );
    return response.data;
  },
  async updateAgreement(
    projectId: string,
    id: string,
    input: IAgreementInput,
  ): Promise<ISupplierAgreement> {
    const response = await httpClient.patch<ISupplierAgreement>(
      `${projectPath(projectId)}/${id}`,
      normalizeAgreementInput(input),
    );
    return response.data;
  },
  async history(projectId: string, id: string): Promise<IAgreementRevision[]> {
    const response = await httpClient.get<IAgreementRevision[]>(
      `${projectPath(projectId)}/${id}/history`,
    );
    return response.data;
  },
};
