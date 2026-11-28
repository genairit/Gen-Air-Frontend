import { useMutation } from "@tanstack/react-query";
import type { IApiCustomer } from "../../interfaces/api.interface";
import type { ICreateCustomerPayload } from "../../interfaces/customer.interface";
import { createCustomerAction, updateCustomerAction } from "../../actions/customer.action";
import { normalizeCustomerForm, customerFormChanges } from "../../utilities/customer-form.utility";

export const useSaveCustomerMutation = (original: IApiCustomer | null) =>
  useMutation({
    mutationFn: async (values: ICreateCustomerPayload) => {
      if (!original) {
        return createCustomerAction(normalizeCustomerForm(values));
      }
      const changes = customerFormChanges(original, values);
      if (Object.keys(changes).length > 0) {
        await updateCustomerAction(original.id, changes);
      }
      return original.id;
    },
  });
