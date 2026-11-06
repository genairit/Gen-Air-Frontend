import { ACTION_FAILURE_MESSAGE } from "../constants/popup.constants";
import { AuthorizationContextChangedError } from "../../../managers/authorization-context.manager";

export const getPopupActionErrorMessage = (error: unknown): string => {
  if (error instanceof AuthorizationContextChangedError) {
    return error.message;
  }

  return ACTION_FAILURE_MESSAGE;
};
