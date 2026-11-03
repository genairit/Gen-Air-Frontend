import { API_ENDPOINTS } from "../constants/api.constant";
import { httpClient, ensureResponse } from "./http-client.service";
import type { UserRoleType } from "../constants/user-role.constant";
import type { IApiAuthorizedUser } from "../interfaces/api.interface";
import type { ILoginPayload } from "../interfaces/api-request.interface";
import { isAuthorizedUser, isLoginResponse } from "../utilities/guards/api.guard";

class AuthService {
  async login(payload: ILoginPayload) {
    const response = await httpClient.post<unknown>(API_ENDPOINTS.LOGIN, payload);

    return ensureResponse(API_ENDPOINTS.LOGIN, response.data, isLoginResponse);
  }

  async switchRole(role: UserRoleType): Promise<IApiAuthorizedUser> {
    const response = await httpClient.patch<unknown>(API_ENDPOINTS.ROLE_SWITCH, { role });

    return ensureResponse(API_ENDPOINTS.ROLE_SWITCH, response.data, isAuthorizedUser);
  }
}

export const authService = new AuthService();
