import { setSession } from "../store/session.store";
import { authService } from "../services/auth.service";
import { persistSession } from "../utilities/session.utility";

interface ILoginRequest {
  email: string;
  password: string;
  isRemembered: boolean;
}

export const loginAction = async ({ email, password, isRemembered }: ILoginRequest) => {
  const session = await authService.login({ email, password, rememberMe: isRemembered });

  persistSession(session, isRemembered);
  setSession(session);
};
