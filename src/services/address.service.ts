import { API_ENDPOINTS } from "../constants/api.constant";
import { isArrayOf } from "../utilities/guards/primitive.guard";
import { httpClient, ensureResponse } from "./http-client.service";
import { isApiPlaceAddress, isApiPlaceSuggestion } from "../utilities/guards/api.guard";
import type { IAddressSearch, IAddressLookup } from "../interfaces/api-request.interface";

class AddressService {
  async getSuggestions({ input, signal, sessionToken }: IAddressSearch) {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.ADDRESS_SUGGESTIONS, {
      signal,
      params: { input, sessionToken },
    });

    return ensureResponse(
      API_ENDPOINTS.ADDRESS_SUGGESTIONS,
      response.data,
      isArrayOf(isApiPlaceSuggestion),
    );
  }

  async getVerifiedAddress({ placeId, sessionToken }: IAddressLookup) {
    const endpoint = API_ENDPOINTS.addressPlace(placeId);
    const response = await httpClient.get<unknown>(endpoint, { params: { sessionToken } });

    return ensureResponse(endpoint, response.data, isApiPlaceAddress);
  }
}

export const addressService = new AddressService();
