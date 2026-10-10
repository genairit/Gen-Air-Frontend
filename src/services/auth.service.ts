import { API_ENDPOINTS } from "../constants/api.constant";
import { isLoginResponse } from "../utilities/guards/api.guard";
import { httpClient, ensureResponse } from "./http-client.service";
import type { ILoginPayload } from "../interfaces/api-request.interface";

class AuthService {
  async login(payload: ILoginPayload) {
    const response = await httpClient.post<unknown>(API_ENDPOINTS.LOGIN, payload);

    return ensureResponse(API_ENDPOINTS.LOGIN, response.data, isLoginResponse);
  }
}

export const authService = new AuthService();
