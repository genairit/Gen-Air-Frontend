import type { UseMutationResult } from "@tanstack/react-query";
import { QUERY_ROOTS } from "../../constants/query-key.constant";
import { customerService } from "../../services/customer.service";
import type { IApiCustomer } from "../../interfaces/api.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaymentTermsType } from "../../constants/payment-terms.constant";
import { AuthorizationContext } from "../../managers/authorization-context.manager";

export const useCustomerPaymentDefaultMutation = (
  customerId: string,
): UseMutationResult<IApiCustomer, Error, PaymentTermsType | null> => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (terms: PaymentTermsType | null): Promise<IApiCustomer> => {
      const context = new AuthorizationContext();
      const customer = await customerService.updatePaymentDefault(customerId, terms);
      context.assertCurrent();
      await client.invalidateQueries({ queryKey: [QUERY_ROOTS.CUSTOMER] });
      context.assertCurrent();
      return customer;
    },
  });
};
