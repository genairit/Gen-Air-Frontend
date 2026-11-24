import {
  createCustomerAction,
  updateCustomerOwnContactAction,
} from "../../actions/customer.action";

import { useMutation } from "@tanstack/react-query";
import type { ICustomerOwnContactInput } from "../../interfaces/customer.interface";

export const useCreateCustomerMutation = () => useMutation({ mutationFn: createCustomerAction });

export const useUpdateCustomerOwnContactMutation = (customerId: string) =>
  useMutation({
    mutationFn: (details: ICustomerOwnContactInput) =>
      updateCustomerOwnContactAction(customerId, details),
  });
