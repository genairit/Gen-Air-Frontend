import type {
  IUpdatePasswordPayload,
  IUserRoleUpdatePayload,
} from "../interfaces/api-request.interface";

import { userService } from "../services/user.service";
import { queryClient } from "../providers/query-client";
import { toUserPayload } from "../utilities/employee.utility";
import { refreshSessionUserAction } from "./session-refresh.action";
import { QUERY_KEYS, QUERY_ROOTS } from "../constants/query-key.constant";
import type { IEmployeeFormValues } from "../interfaces/employee.interface";
import { SessionBroadcastManager } from "../managers/session-broadcast.manager";
import { AuthorizationContext } from "../managers/authorization-context.manager";

const invalidateUserQueries = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.USERS] }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ROLE_COUNTS }),
  ]);

export const addEmployeeAction = async (values: IEmployeeFormValues): Promise<void> => {
  const context = new AuthorizationContext();
  await userService.create(toUserPayload(values));
  context.assertCurrent();
  await invalidateUserQueries();
  context.assertCurrent();
};

export const updateEmployeeRolesAction = async ({
  userId,
  changes,
}: {
  userId: string;
  changes: IUserRoleUpdatePayload;
}): Promise<void> => {
  const context = new AuthorizationContext();
  await userService.update(userId, changes);
  context.assertCurrent();
  await invalidateUserQueries();
  context.assertCurrent();
  SessionBroadcastManager.notifyUserChanged(userId);
  await refreshSessionUserAction(userId);
};

export const removeEmployeeAction = async (userId: string): Promise<void> => {
  const context = new AuthorizationContext();
  await userService.delete(userId);
  context.assertCurrent();
  await invalidateUserQueries();
  context.assertCurrent();
  SessionBroadcastManager.notifyUserChanged(userId);
};

export const updateMyPasswordAction = async (payload: IUpdatePasswordPayload): Promise<void> => {
  const context = new AuthorizationContext();
  await userService.updateMyPassword(payload);
  context.assertCurrent();
};
