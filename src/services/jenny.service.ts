import { API_ENDPOINTS } from "../constants/api.constant";
import { httpClient, ensureResponse } from "./http-client.service";
import { JENNY_CHAT_TIMEOUT_MS } from "../constants/jenny.constant";
import { isJennyChatResponse } from "../utilities/guards/jenny.guard";
import type { IJennyChatRequest } from "../interfaces/jenny.interface";

export const jennyService = {
  async chat(request: IJennyChatRequest, signal: AbortSignal) {
    const endpoint = API_ENDPOINTS.JENNY_CHAT;
    const response = await httpClient.post<unknown>(endpoint, request, {
      signal,
      timeout: JENNY_CHAT_TIMEOUT_MS,
    });

    return ensureResponse(endpoint, response.data, isJennyChatResponse);
  },
};
