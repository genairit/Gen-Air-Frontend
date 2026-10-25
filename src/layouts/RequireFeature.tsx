import type { FC, ReactNode } from "react";
import { useSessionUser } from "../store/session.store";
import { ICON_NAMES } from "../constants/icon.constant";
import EmptyState from "../components/EmptyState/EmptyState";
import { hasPermission } from "../utilities/permission.utility";
import { PERMISSION_COPY, type PermissionType } from "../constants/permission.constant";

interface IRequireFeatureProps {
  children: ReactNode;
  permission: PermissionType;
}

const RequireFeature: FC<IRequireFeatureProps> = ({ children, permission }) => {
  const user = useSessionUser();

  if (!hasPermission(user, permission)) {
    return (
      <EmptyState
        icon={ICON_NAMES.INFO}
        title={PERMISSION_COPY.DENIED}
        description={PERMISSION_COPY.DESCRIPTION}
      />
    );
  }

  return children;
};

export default RequireFeature;
