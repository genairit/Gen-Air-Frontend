import Button from "../../../components/Button/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { useSessionUser } from "../../../store/session.store";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import { BUTTON_SIZES } from "../../../components/Button/constants/button.constants";
import { PROJECT_QUOTATIONS_COPY } from "../../../constants/quotation-sharing.constant";
import { buildProjectQuotationCreatePath } from "../../../constants/navigation.constant";

const ProjectQuotationCreateButton = ({ projectId }: { projectId: string }) => {
  const user = useSessionUser();
  const navigate = useNavigate();
  const location = useLocation();

  if (!hasPermission(user, PERMISSIONS.QUOTATIONS_CREATE)) {
    return null;
  }

  const openCreate = () =>
    navigate(buildProjectQuotationCreatePath(projectId), {
      state: { quotationReturnTo: location.pathname + location.search },
    });

  return (
    <Button
      onClick={openCreate}
      size={BUTTON_SIZES.COMPACT}
      text={PROJECT_QUOTATIONS_COPY.CREATE}
    />
  );
};

export default ProjectQuotationCreateButton;
