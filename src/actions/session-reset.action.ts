import { setSession } from "../store/session.store";
import { queryClient } from "../providers/query-client";
import { clearStoredSession } from "../utilities/session.utility";

export const clearSessionAction = () => {
  clearStoredSession();
  setSession(null);
  queryClient.clear();
};
