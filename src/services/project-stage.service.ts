import { API_ENDPOINTS } from "../constants/api.constant";
import { isArrayOf } from "../utilities/guards/primitive.guard";
import { isApiProjectStage } from "../utilities/guards/api.guard";
import { httpClient, ensureResponse } from "./http-client.service";

const isProjectStageList = isArrayOf(isApiProjectStage);
class ProjectStageService {
  async getAll() {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.PROJECT_STAGES);
    return ensureResponse(API_ENDPOINTS.PROJECT_STAGES, response.data, isProjectStageList);
  }
}
export const projectStageService = new ProjectStageService();
