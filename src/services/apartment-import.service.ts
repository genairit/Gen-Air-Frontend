import type {
  IApartmentImportRequest,
  IApartmentImportResponse,
} from "../interfaces/apartment-import.interface";

import { API_ENDPOINTS } from "../constants/api.constant";
import { httpClient, ensureResponse } from "./http-client.service";
import { isApartmentImportResponse } from "../utilities/guards/apartment-import.guard";

const getImportEndpoint = (buildingId: string): string =>
  `${API_ENDPOINTS.projectApartments(buildingId)}/import`;

class ApartmentImportService {
  async template(buildingId: string): Promise<Blob> {
    const response = await httpClient.get<unknown>(`${getImportEndpoint(buildingId)}/template`, {
      responseType: "blob",
    });
    const blob = response.data;
    if (!(blob instanceof Blob) || blob.size === 0) {
      throw new Error("Invalid apartment template response");
    }

    return blob;
  }

  async upload({
    file,
    buildingId,
    onProgress,
  }: IApartmentImportRequest): Promise<IApartmentImportResponse> {
    const endpoint = getImportEndpoint(buildingId);
    const body = new FormData();
    body.append("file", file);
    const response = await httpClient.post<unknown>(endpoint, body, {
      onUploadProgress: ({ loaded, total }) => {
        const percentage = total ? Math.round((loaded / total) * 100) : null;
        const progress = percentage === 100 ? null : percentage;
        onProgress(progress);
      },
      headers: { Accept: "application/json" },
    });
    return ensureResponse(endpoint, response.data, isApartmentImportResponse);
  }
}

export const apartmentImportService = new ApartmentImportService();
