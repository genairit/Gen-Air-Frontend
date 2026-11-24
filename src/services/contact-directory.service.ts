import type {
  ICustomerContact,
  ICustomerContactInput,
} from "../interfaces/customer-contact.interface";

import { httpClient, ensureResponse } from "./http-client.service";
import { isCustomerContact, isCustomerContactList } from "../utilities/customer-contact.utility";

const DIRECTORY_ENDPOINT = "/contact-directory";

class ContactDirectoryService {
  async search(search: string, signal?: AbortSignal): Promise<ICustomerContact[]> {
    const response = await httpClient.get<unknown>(DIRECTORY_ENDPOINT, {
      signal,
      params: { search },
    });
    return ensureResponse(DIRECTORY_ENDPOINT, response.data, isCustomerContactList);
  }

  async create(input: ICustomerContactInput) {
    const response = await httpClient.post<unknown>(DIRECTORY_ENDPOINT, input);
    return ensureResponse(DIRECTORY_ENDPOINT, response.data, isCustomerContact);
  }

  async update(id: string, input: ICustomerContactInput) {
    const endpoint = `${DIRECTORY_ENDPOINT}/${id}`;
    const response = await httpClient.patch<unknown>(endpoint, input);
    return ensureResponse(endpoint, response.data, isCustomerContact);
  }
}

export const contactDirectoryService = new ContactDirectoryService();
