import type { UseMutationResult } from "@tanstack/react-query";
import { QUERY_ROOTS } from "../../constants/query-key.constant";
import { customerService } from "../../services/customer.service";
import type { IApiCustomer } from "../../interfaces/api.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthorizationContext } from "../../managers/authorization-context.manager";
import type { IPaymentConfiguration } from "../../interfaces/payment-configuration.interface";

export const useCustomerPaymentDefaultMutation = (
  customerId: string,
): UseMutationResult<IApiCustomer, Error, IPaymentConfiguration> => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (configuration: IPaymentConfiguration): Promise<IApiCustomer> => {
      const context = new AuthorizationContext();
      const customer = await customerService.updatePaymentDefault(customerId, configuration);
      context.assertCurrent();
      await client.invalidateQueries({ queryKey: [QUERY_ROOTS.CUSTOMER] });
      context.assertCurrent();
      await client.invalidateQueries({ queryKey: [QUERY_ROOTS.CUSTOMERS] });
      context.assertCurrent();
      return customer;
    },
  });
};
