import axios, { isAxiosError } from "axios";
import { queryClient } from "../providers/query-client";
import { getAccessToken } from "../store/session.store";
import { API_ENDPOINTS } from "../constants/api.constant";
import { clearSessionAction } from "../actions/session-reset.action";
import { SESSION_USER_QUERY_KEY } from "../constants/permission.constant";
import { EnvironmentManager } from "../utilities/environment-manager.utility";
import { HTTP_STATUS, ENVIRONMENT_KEYS, DEFAULT_API_BASE_URL } from "../constants/api.constant";

export const httpClient = axios.create({
  baseURL: EnvironmentManager.get(ENVIRONMENT_KEYS.API_BASE_URL, {
    defaultValue: DEFAULT_API_BASE_URL,
  }),
});

httpClient.interceptors.request.use(config => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  response => response,
  async (error: unknown) => {
    const isUnauthorized =
      isAxiosError(error) && error.response?.status === HTTP_STATUS.UNAUTHORIZED;

    if (isUnauthorized && getAccessToken()) {
      clearSessionAction();
    }

    const shouldRefreshPermissions =
      isAxiosError(error) &&
      error.response?.status === HTTP_STATUS.FORBIDDEN &&
      error.config?.url !== API_ENDPOINTS.MY_USER;

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
