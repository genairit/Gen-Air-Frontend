import { queryClient } from "../providers/query-client";
import { customerService } from "../services/customer.service";
import { QUERY_KEYS, QUERY_ROOTS } from "../constants/query-key.constant";
import type { ICustomerCreateRequest } from "../interfaces/customer.interface";
import { AuthorizationContext } from "../managers/authorization-context.manager";
import type { ICustomerProjectLinkInput } from "../interfaces/customer-project-link.interface";

export const createCustomerAction = async (payload: ICustomerCreateRequest): Promise<string> => {
  const context = new AuthorizationContext();
  const customer = await customerService.create(payload);
  context.assertCurrent();
  queryClient.setQueryData(QUERY_KEYS.customer(customer.id), customer);
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.CUSTOMERS] }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER_SYNC_STATUS_COUNTS }),
  ]);
  context.assertCurrent();
  return customer.id;
};

export const linkCustomerProjectsAction = async (
  customerId: string,
  projects: ICustomerProjectLinkInput[],
): Promise<void> => {
  const context = new AuthorizationContext();
  await customerService.linkProjects(customerId, projects);
  context.assertCurrent();
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.CUSTOMER_PROJECTS, customerId] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECTS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.APARTMENTS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECT] }),
  ]);
  context.assertCurrent();
};
