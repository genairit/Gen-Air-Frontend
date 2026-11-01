import { queryClient } from "../providers/query-client";
import type { IApiAuthorizedUser } from "../interfaces/api.interface";
import { SESSION_USER_QUERY_KEY } from "../constants/permission.constant";
import { getAccessToken, getSession, setSession } from "../store/session.store";
import { persistSession, isSessionRemembered } from "../utilities/session.utility";

export const applySessionUserAction = (accessToken: string, user: IApiAuthorizedUser): void => {
  const current = getSession();

  if (!current || getAccessToken() !== accessToken || current.user.id !== user.id) {
    return;
  }

  const hasChanged = JSON.stringify(current.user) !== JSON.stringify(user);

  if (!hasChanged) {
    return;
  }

  queryClient.removeQueries({
    predicate: query => query.queryKey[0] !== SESSION_USER_QUERY_KEY[0],
  });
  const updated = { accessToken, user };
  persistSession(updated, isSessionRemembered());
  setSession(updated);
};
