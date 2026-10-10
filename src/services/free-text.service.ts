import type {
  ISuggestOptions,
  IValidateOptions,
  IFreeTextValidationResult,
} from "../interfaces/free-text.interface";

import {
  isFreeTextSuggestResponse,
  isFreeTextValidationResult,
} from "../utilities/free-text-response.utility";

import axios from "axios";

const createFreeTextClient = (endpoint?: string) => axios.create({ baseURL: endpoint || "" });

class FreeTextService {
  async validate({ endpoint, text, signal }: IValidateOptions): Promise<IFreeTextValidationResult> {
    const instance = createFreeTextClient(endpoint);

    const response = await instance.post<unknown>("/api/free-text/validate", { text }, { signal });

    const data = response.data;

    if (!isFreeTextValidationResult(data)) {
      throw new Error("Invalid validation response structure");
    }

    return data;
  }

  async suggest({ endpoint, query, limit, signal }: ISuggestOptions): Promise<string[]> {
    const instance = createFreeTextClient(endpoint);

    const response = await instance.get<unknown>("/api/free-text/suggest", {
      signal,
      params: { query, limit },
    });

    const data = response.data;

    if (!isFreeTextSuggestResponse(data)) {
      throw new Error("Invalid suggest response structure");
    }

    return data.suggestions;
  }
}

export const freeTextService = new FreeTextService();
