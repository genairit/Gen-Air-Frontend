import { queryClient } from "../providers/query-client";
import { QUERY_ROOTS } from "../constants/query-key.constant";
import { customerContactService } from "../services/customer-contact.service";
import { toCustomerContactInput } from "../utilities/customer-contact.utility";
import { CUSTOMER_CONTACT_QUERY_ROOT } from "../constants/customer-contact.constant";
import type { ICustomerContactSave } from "../interfaces/customer-contact.interface";

export const saveCustomerContactAction = async ({ customerId, editor }: ICustomerContactSave) => {
  const input = toCustomerContactInput(editor.values);
  const contact =
    editor.id === null
      ? await customerContactService.create(customerId, input)
      : await customerContactService.update(customerId, editor.id, input);
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [CUSTOMER_CONTACT_QUERY_ROOT, customerId] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.CUSTOMER, customerId] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECT] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECTS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.CUSTOMERS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.APARTMENTS] }),
  ]);
  return contact;
};
