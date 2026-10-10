import { userService } from "../services/user.service";
import { queryClient } from "../providers/query-client";
import { toUserPayload } from "../utilities/employee.utility";
import { QUERY_KEYS, QUERY_ROOTS } from "../constants/query-key.constant";
import type { IEmployeeFormValues } from "../interfaces/employee.interface";

const invalidateUserQueries = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.USERS] }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ROLE_COUNTS }),
  ]);

export const addEmployeeAction = async (values: IEmployeeFormValues) => {
  await userService.create(toUserPayload(values));
  await invalidateUserQueries();
};

export const removeEmployeeAction = async (userId: string) => {
  await userService.delete(userId);
  await invalidateUserQueries();
};

export const updateMyPasswordAction = (password: string) => userService.updateMyPassword(password);
