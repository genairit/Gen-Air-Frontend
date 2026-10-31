import { API_ENDPOINTS } from "../constants/api.constant";
import { isRecord } from "../utilities/guards/primitive.guard";
import { httpClient, ensureResponse } from "./http-client.service";
import type { IProjectNameAvailabilityRequest } from "../interfaces/project-constraints.interface";

interface IProjectNameAvailability {
  available: boolean;
}

const isNameAvailability = (value: unknown): value is IProjectNameAvailability =>
  isRecord(value) && typeof value.available === "boolean";

export const getProjectNameAvailability = async ({
  name,
  signal,
  excludeId,
}: IProjectNameAvailabilityRequest): Promise<boolean> => {
  const endpoint = API_ENDPOINTS.PROJECT_NAME_AVAILABILITY;
  const response = await httpClient.get<unknown>(endpoint, {
    signal,
    params: { name, excludeId },
  });

  return ensureResponse(endpoint, response.data, isNameAvailability).available;
};
