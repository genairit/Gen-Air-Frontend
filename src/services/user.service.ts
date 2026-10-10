import { httpClient, ensureResponse } from "./http-client.service";
import { API_ENDPOINTS, API_PAGE_SIZE } from "../constants/api.constant";
import type { IUserQuery, IUserPayload } from "../interfaces/api-request.interface";
import { isApiUser, isCursorPageOf, isUserRoleCounts } from "../utilities/guards/api.guard";

class UserService {
  async getByFilter({ search, role }: IUserQuery) {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.USERS, {
      params: { search: search.trim() || null, role, batchSize: API_PAGE_SIZE },
    });

    return ensureResponse(API_ENDPOINTS.USERS, response.data, isCursorPageOf(isApiUser)).items;
  }

  async getRoleCounts() {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.USER_ROLE_COUNTS);

    return ensureResponse(API_ENDPOINTS.USER_ROLE_COUNTS, response.data, isUserRoleCounts);
  }

  async create(user: IUserPayload) {
    const response = await httpClient.post<unknown>(API_ENDPOINTS.USERS, user);

    return ensureResponse(API_ENDPOINTS.USERS, response.data, isApiUser);
  }

  async delete(userId: string) {
    await httpClient.delete(API_ENDPOINTS.userById(userId));
  }

  async updateMyPassword(password: string) {
    await httpClient.patch(API_ENDPOINTS.MY_PASSWORD, { password });
  }
}

export const userService = new UserService();
