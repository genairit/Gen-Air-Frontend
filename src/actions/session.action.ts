import { setSession } from "../store/session.store";
import { authService } from "../services/auth.service";
import { queryClient } from "../providers/query-client";
import { persistSession } from "../utilities/session.utility";
import { SessionRequestManager } from "../managers/session-request.manager";

interface ILoginRequest {
  email: string;
  password: string;
  isRemembered: boolean;
}

export const loginAction = async ({ email, password, isRemembered }: ILoginRequest) => {
  const session = await authService.login({ email, password, rememberMe: isRemembered });

  SessionRequestManager.retireSessionRequests();
  SessionRequestManager.invalidateAuthorization();
  queryClient.clear();
  persistSession(session, isRemembered);
  setSession(session);
};
