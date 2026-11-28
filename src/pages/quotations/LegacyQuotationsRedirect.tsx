import { Navigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../constants/routes.constant";
import { buildQuotationClonePath } from "../../constants/navigation.constant";

const LegacyQuotationsRedirect = () => {
  const [params] = useSearchParams();
  const sourceId = params.get("cloneFrom");
  return <Navigate replace to={sourceId ? buildQuotationClonePath(sourceId) : ROUTE_PATHS.BOARD} />;
};

export default LegacyQuotationsRedirect;
