import { API_ENDPOINTS } from "../constants/api.constant";
import { isArrayOf } from "../utilities/guards/primitive.guard";
import { isApiProjectStage } from "../utilities/guards/api.guard";
import { httpClient, ensureResponse } from "./http-client.service";
import type { IProjectStagePayload } from "../interfaces/api-request.interface";

const isProjectStageList = isArrayOf(isApiProjectStage);

const toStagePayload = ({ name, tag, description }: IProjectStagePayload) => ({
  name,
  ...(tag ? { tag } : {}),
  ...(description ? { description } : {}),
});

class ProjectStageService {
  async getAll() {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.PROJECT_STAGES);

    return ensureResponse(API_ENDPOINTS.PROJECT_STAGES, response.data, isProjectStageList);
  }

  async create(stage: IProjectStagePayload) {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.PROJECT_STAGES,
      toStagePayload(stage),
    );

    return ensureResponse(API_ENDPOINTS.PROJECT_STAGES, response.data, isApiProjectStage);
  }

  async reorder(stageIds: string[]) {
    const response = await httpClient.put<unknown>(API_ENDPOINTS.PROJECT_STAGE_ORDER, { stageIds });

    return ensureResponse(API_ENDPOINTS.PROJECT_STAGE_ORDER, response.data, isProjectStageList);
  }

  async delete(stageId: string) {
    await httpClient.delete(API_ENDPOINTS.projectStageById(stageId));
  }
}

export const projectStageService = new ProjectStageService();
