import { isAxiosError } from "axios";
import { getSession } from "../store/session.store";
import { logger } from "../utilities/logger.utility";
import { CancelledError } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import { HTTP_STATUS } from "../constants/api.constant";
import { clearSessionAction } from "./session-reset.action";
import type { IApiAuthorizedUser } from "../interfaces/api.interface";
import { applySessionUserAction } from "./session-permissions.action";
import { SessionRequestManager } from "../managers/session-request.manager";

export const verifySessionUserAction = async (): Promise<IApiAuthorizedUser> => {
  const session = getSession();

  if (SessionRequestManager.isSwitching()) {
    await SessionRequestManager.waitForSwitch();
  }

  const currentSession = getSession();
  const hasSameToken = session?.accessToken === currentSession?.accessToken;
  const hasSameAccount = session?.user.id === currentSession?.user.id;
  if (!session || !hasSameToken || !hasSameAccount) {
    throw new CancelledError({ silent: true });
  }

  const generation = SessionRequestManager.beginRefresh();

  if (generation === null) {
    throw new CancelledError({ silent: true });
  }

  try {
    const user = await userService.getMe();

    if (!SessionRequestManager.isCurrent(generation)) {
      throw new CancelledError({ silent: true });
    }

    await applySessionUserAction(session.accessToken, user);

    if (!SessionRequestManager.isCurrent(generation)) {
      throw new CancelledError({ silent: true });
    }

    return user;
  } catch (error) {
    if (!SessionRequestManager.isCurrent(generation)) {
      throw new CancelledError({ silent: true });
    }

    const isSessionRevoked =
      isAxiosError(error) && error.response?.status === HTTP_STATUS.UNAUTHORIZED;

    if (isSessionRevoked && getSession()?.accessToken === session.accessToken) {
      clearSessionAction();
    }

    throw error;
  }
};

export const refreshSessionUserAction = async (userId: string): Promise<void> => {
  const session = getSession();

  if (!session || session.user.id !== userId) {
    return;
  }

  try {
    if (SessionRequestManager.isSwitching()) {
      await SessionRequestManager.waitForSwitch();
    }

    if (getSession()?.user.id !== userId) {
      return;
    }

    await verifySessionUserAction();
  } catch (error) {
    if (error instanceof CancelledError) {
      return;
    }

    logger.error("Failed to refresh the current role in this tab", { error });
  }
};
