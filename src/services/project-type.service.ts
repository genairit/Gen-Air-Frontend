import { API_ENDPOINTS } from "../constants/api.constant";
import { isArrayOf } from "../utilities/guards/primitive.guard";
import { isApiProjectType } from "../utilities/guards/api.guard";
import { httpClient, ensureResponse } from "./http-client.service";

class ProjectTypeService {
  async getAll() {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.PROJECT_TYPES);

    return ensureResponse(API_ENDPOINTS.PROJECT_TYPES, response.data, isArrayOf(isApiProjectType));
  }
}

export const projectTypeService = new ProjectTypeService();
