import { setSession } from "../store/session.store";
import { queryClient } from "../providers/query-client";
import { clearStoredSession } from "../utilities/session.utility";
import { SessionRequestManager } from "../managers/session-request.manager";

export const clearSessionAction = () => {
  SessionRequestManager.retireSessionRequests();
  SessionRequestManager.invalidateAuthorization();
  clearStoredSession();
  setSession(null);
  queryClient.clear();
};
