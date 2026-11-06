import { isAxiosError } from "axios";
import { getSession } from "../store/session.store";
import { authService } from "../services/auth.service";
import { queryClient } from "../providers/query-client";
import { HTTP_STATUS } from "../constants/api.constant";
import type { UserRoleType } from "../constants/user-role.constant";
import { applySessionUserAction } from "./session-permissions.action";
import { SESSION_USER_QUERY_KEY } from "../constants/permission.constant";
import { SessionRequestManager } from "../managers/session-request.manager";
import { SessionBroadcastManager } from "../managers/session-broadcast.manager";
import { AuthorizationContext } from "../managers/authorization-context.manager";

export const switchActiveRoleAction = async (role: UserRoleType): Promise<void> => {
  const session = getSession();

  if (!session) {
    throw new Error("An active session is required to change roles");
  }

  const generation = SessionRequestManager.beginSwitch();
  const context = new AuthorizationContext();

  try {
    await queryClient.cancelQueries({ queryKey: SESSION_USER_QUERY_KEY });
    context.assertCurrent();
    const user = await authService.switchRole(role);

    if (!SessionRequestManager.isCurrent(generation)) {
      return;
    }

    SessionRequestManager.finishSwitch(generation);
    await applySessionUserAction(session.accessToken, user);
    SessionBroadcastManager.notifyUserChanged(user.id);
  } catch (error) {
    const isDenied = isAxiosError(error) && error.response?.status === HTTP_STATUS.FORBIDDEN;
    const ownsSwitch = SessionRequestManager.isCurrent(generation);
    const shouldVerify = isDenied && ownsSwitch && context.isCurrent();

    SessionRequestManager.finishSwitch(generation);

    if (shouldVerify) {
      await queryClient.invalidateQueries({ queryKey: SESSION_USER_QUERY_KEY });
    }

    throw error;
  } finally {
    SessionRequestManager.finishSwitch(generation);
  }
};
