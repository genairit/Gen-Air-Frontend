import { httpClient, ensureResponse } from "./http-client.service";
import { CUSTOMER_CONTACT_ENDPOINTS } from "../constants/customer-contact.constant";
import type { ICustomerContactInput } from "../interfaces/customer-contact.interface";
import { isCustomerContact, isCustomerContactList } from "../utilities/customer-contact.utility";

export const customerContactService = {
  getAll: async (customerId: string) => {
    const endpoint = CUSTOMER_CONTACT_ENDPOINTS.list(customerId);
    const response = await httpClient.get<unknown>(endpoint);
    return ensureResponse(endpoint, response.data, isCustomerContactList);
  },
  create: async (customerId: string, input: ICustomerContactInput) => {
    const endpoint = CUSTOMER_CONTACT_ENDPOINTS.list(customerId);
    const response = await httpClient.post<unknown>(endpoint, input);
    return ensureResponse(endpoint, response.data, isCustomerContact);
  },
  update: async (customerId: string, contactId: string, input: ICustomerContactInput) => {
    const endpoint = CUSTOMER_CONTACT_ENDPOINTS.item(customerId, contactId);
    const response = await httpClient.patch<unknown>(endpoint, input);
    return ensureResponse(endpoint, response.data, isCustomerContact);
  },
};
