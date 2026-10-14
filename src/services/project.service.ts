import type {
  IProjectQuery,
  IProjectPayload,
  IProjectPageQuery,
} from "../interfaces/api-request.interface";

import { httpClient, ensureResponse } from "./http-client.service";
import { PROJECT_BOARD_PAGE_SIZE } from "../constants/board.constant";
import { API_ENDPOINTS, API_PAGE_SIZE } from "../constants/api.constant";
import { isApiProject, isCursorPageOf, isProjectStageCounts } from "../utilities/guards/api.guard";

const toQueryParams = ({ search, managerId, projectTypeId }: IProjectQuery) => ({
  search: search.trim() || null,
  managerId,
  projectTypeId,
});

class ProjectService {
  async getByFilter(query: IProjectQuery) {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.PROJECTS, {
      params: { ...toQueryParams(query), batchSize: API_PAGE_SIZE },
    });

    return ensureResponse(API_ENDPOINTS.PROJECTS, response.data, isCursorPageOf(isApiProject))
      .items;
  }

  async getPage(query: IProjectPageQuery, batchCursor: string | null) {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.PROJECTS, {
      params: {
        ...toQueryParams(query),
        batchCursor,
        stageId: query.stageId,
        batchSize: PROJECT_BOARD_PAGE_SIZE,
      },
    });

    return ensureResponse(API_ENDPOINTS.PROJECTS, response.data, isCursorPageOf(isApiProject));
  }

  async getStageCounts(query: IProjectQuery) {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.PROJECT_STAGE_COUNTS, {
      params: toQueryParams(query),
    });

    return ensureResponse(API_ENDPOINTS.PROJECT_STAGE_COUNTS, response.data, isProjectStageCounts);
  }

  async getById(projectId: string) {
    const endpoint = API_ENDPOINTS.projectById(projectId);
    const response = await httpClient.get<unknown>(endpoint);

    return ensureResponse(endpoint, response.data, isApiProject);
  }

  async create(payload: IProjectPayload) {
    const response = await httpClient.post<unknown>(API_ENDPOINTS.PROJECTS, payload);

    return ensureResponse(API_ENDPOINTS.PROJECTS, response.data, isApiProject);
  }

  async update(projectId: string, payload: IProjectPayload) {
    const endpoint = API_ENDPOINTS.projectById(projectId);
    const response = await httpClient.patch<unknown>(endpoint, payload);

    return ensureResponse(endpoint, response.data, isApiProject);
  }

  async moveToStage(projectId: string, stageId: string) {
    const endpoint = API_ENDPOINTS.projectStage(projectId);
    const response = await httpClient.patch<unknown>(endpoint, { stageId });

    return ensureResponse(endpoint, response.data, isApiProject);
  }

  async delete(projectId: string) {
    await httpClient.delete(API_ENDPOINTS.projectById(projectId));
  }
}

export const projectService = new ProjectService();
