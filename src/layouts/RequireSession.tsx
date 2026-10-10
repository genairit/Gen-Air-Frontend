import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../store/session.store";
import { ROUTE_PATHS } from "../constants/routes.constant";

const RequireSession = () => {
  const session = useSession();

  if (!session) {
    return <Navigate replace to={ROUTE_PATHS.LOGIN} />;
  }

  return <Outlet />;
};

export default RequireSession;
