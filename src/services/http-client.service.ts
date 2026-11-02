import axios, { isAxiosError } from "axios";
import { queryClient } from "../providers/query-client";
import { getAccessToken } from "../store/session.store";
import type { InternalAxiosRequestConfig } from "axios";
import { API_ENDPOINTS } from "../constants/api.constant";
import { clearSessionAction } from "../actions/session-reset.action";
import { SESSION_USER_QUERY_KEY } from "../constants/permission.constant";
import { EnvironmentManager } from "../utilities/environment-manager.utility";
import { AuthorizationContext } from "../managers/authorization-context.manager";
import { HTTP_STATUS, ENVIRONMENT_KEYS, DEFAULT_API_BASE_URL } from "../constants/api.constant";

const requestContexts = new WeakMap<InternalAxiosRequestConfig, AuthorizationContext>();

export const httpClient = axios.create({
  baseURL: EnvironmentManager.get(ENVIRONMENT_KEYS.API_BASE_URL, {
    defaultValue: DEFAULT_API_BASE_URL,
  }),
});

httpClient.interceptors.request.use(
  config => {
    const isSessionRequest = config.url === API_ENDPOINTS.LOGIN;

    if (!isSessionRequest) {
      requestContexts.set(config, new AuthorizationContext());
    }

    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  null,
  { synchronous: true },
);

httpClient.interceptors.response.use(
  response => {
    requestContexts.get(response.config)?.assertCurrent();
    return response;
  },
  async (error: unknown) => {
    if (isAxiosError(error) && error.config) {
      requestContexts.get(error.config)?.assertCurrent();
    }

    const isUnauthorized =
      isAxiosError(error) && error.response?.status === HTTP_STATUS.UNAUTHORIZED;
    const isSessionVerification =
      isAxiosError(error) && error.config?.url === API_ENDPOINTS.MY_USER;

    if (isUnauthorized && !isSessionVerification && getAccessToken()) {
      clearSessionAction();
    }

    const shouldRefreshPermissions =
      isAxiosError(error) &&
      error.response?.status === HTTP_STATUS.FORBIDDEN &&
      error.config?.url !== API_ENDPOINTS.MY_USER &&
      error.config?.url !== API_ENDPOINTS.ROLE_SWITCH;

    if (shouldRefreshPermissions && getAccessToken()) {
      await queryClient.invalidateQueries({ queryKey: SESSION_USER_QUERY_KEY });
    }

    throw error;
  },
);

class InvalidResponseError extends Error {
  constructor(endpoint: string) {
    super(`Unexpected response shape from ${endpoint}`);
    this.name = "InvalidResponseError";
  }
}

export const ensureResponse = <TData>(
  endpoint: string,
  data: unknown,
  isExpected: (value: unknown) => value is TData,
) => {
  if (!isExpected(data)) {
    throw new InvalidResponseError(endpoint);
  }

  return data;
};
