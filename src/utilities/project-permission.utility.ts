import { hasPermission } from "./permission.utility";
import { PERMISSIONS } from "../constants/permission.constant";
import type { IApiAuthorizedUser } from "../interfaces/api.interface";
import type { IProjectPayload } from "../interfaces/api-request.interface";

export const toAuthorizedProjectUpdate = (
  payload: IProjectPayload,
  user: IApiAuthorizedUser | null,
): IProjectPayload => {
  if (hasPermission(user, PERMISSIONS.PROJECTS_STATUS_CHANGE)) {
    return payload;
  }

  const editable = { ...payload };
  delete editable.stageId;

  return editable;
};
