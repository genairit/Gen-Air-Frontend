import Button from "../components/Button/Button";
import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../store/session.store";
import { ICON_NAMES } from "../constants/icon.constant";
import { ROUTE_PATHS } from "../constants/routes.constant";
import EmptyState from "../components/EmptyState/EmptyState";
import { useSessionUserQuery } from "../hooks/session-user.hook";
import LoadingState from "../components/LoadingState/LoadingState";
import { PERMISSION_COPY } from "../constants/permission.constant";

const RequireSession = () => {
  const session = useSession();
  const userQuery = useSessionUserQuery(session);

  if (!session) {
    return <Navigate replace to={ROUTE_PATHS.LOGIN} />;
  }

  if (userQuery.isError) {
    return (
      <EmptyState
        icon={ICON_NAMES.INFO}
        title={PERMISSION_COPY.ERROR}
        description={PERMISSION_COPY.DESCRIPTION}
        action={
          <Button
            text={PERMISSION_COPY.RETRY}
            onClick={async () => {
              await userQuery.refetch();
            }}
          />
        }
      />
    );
  }

  const isVerified =
    userQuery.isSuccess && JSON.stringify(session.user) === JSON.stringify(userQuery.data);

  if (!isVerified) {
    return <LoadingState label={PERMISSION_COPY.LOADING} />;
  }

  return <Outlet />;
};

export default RequireSession;
