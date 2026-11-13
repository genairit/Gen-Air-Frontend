import type {
  IBoqSource,
  IBoqLineAdd,
  IBoqPreview,
  IProjectBoq,
  IBoqLineEdit,
  IBoqMaterial,
  IBoqRevision,
} from "../interfaces/project-boq.interface";

import { httpClient } from "./http-client.service";

const path = (projectId: string) => `/project-boq/${projectId}`;

export const projectBoqService = {
  async revision(projectId: string, revision: number): Promise<IBoqRevision> {
    const response = await httpClient.get<IBoqRevision>(`${path(projectId)}/revisions/${revision}`);
    return response.data;
  },
  async get(projectId: string): Promise<IProjectBoq> {
    const response = await httpClient.get<IProjectBoq>(path(projectId));
    return response.data;
  },
  async sources(projectId: string): Promise<IBoqSource[]> {
    const response = await httpClient.get<IBoqSource[]>(`${path(projectId)}/sources`);
    return response.data;
  },
  async materials(search: string): Promise<IBoqMaterial[]> {
    const response = await httpClient.get<IBoqMaterial[]>("/project-boq/materials", {
      params: { search, limit: 50 },
    });
    return response.data;
  },
  async preview(projectId: string, quotationId: string): Promise<IBoqPreview> {
    const response = await httpClient.get<IBoqPreview>(`${path(projectId)}/preview`, {
      params: { quotationId },
    });
    return response.data;
  },
  async generate(
    projectId: string,
    preview: IBoqPreview,
    expectedRevision: number,
  ): Promise<IProjectBoq> {
    const response = await httpClient.post<IProjectBoq>(`${path(projectId)}/generate`, {
      quotationId: preview.quotationId,
      quotationVersion: preview.quotationVersion,
      previewFingerprint: preview.fingerprint,
      expectedRevision,
    });
    return response.data;
  },
  async updateLine(projectId: string, lineId: string, edit: IBoqLineEdit): Promise<IProjectBoq> {
    const response = await httpClient.patch<IProjectBoq>(
      `${path(projectId)}/lines/${lineId}`,
      edit,
    );
    return response.data;
  },
  async addLine(projectId: string, input: IBoqLineAdd): Promise<IProjectBoq> {
    const response = await httpClient.post<IProjectBoq>(`${path(projectId)}/lines`, input);
    return response.data;
  },
};
