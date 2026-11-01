import type { UseMutationResult } from "@tanstack/react-query";
import { QUERY_ROOTS } from "../../constants/query-key.constant";
import { customerService } from "../../services/customer.service";
import type { IApiCustomer } from "../../interfaces/api.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaymentTermsType } from "../../constants/payment-terms.constant";

export const useCustomerPaymentDefaultMutation = (
  customerId: string,
): UseMutationResult<IApiCustomer, Error, PaymentTermsType | null> => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (terms: PaymentTermsType | null) =>
      customerService.updatePaymentDefault(customerId, terms),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: [QUERY_ROOTS.CUSTOMER] });
    },
  });
};
