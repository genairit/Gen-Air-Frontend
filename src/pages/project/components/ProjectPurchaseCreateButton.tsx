import type { FC } from "react";
import Button from "../../../components/Button/Button";
import { useNavigate, generatePath } from "react-router-dom";
import { useSessionUser } from "../../../store/session.store";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import { BUTTON_SIZES } from "../../../components/Button/constants/button.constants";

interface IProjectPurchaseCreateButtonProps {
  projectId: string;
}

const ProjectPurchaseCreateButton: FC<IProjectPurchaseCreateButtonProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const user = useSessionUser();

  if (!hasPermission(user, PERMISSIONS.PROJECT_BOQ_MANAGE)) {
    return null;
  }

  return (
    <Button
      text="יצירת כתב רכש"
      size={BUTTON_SIZES.COMPACT}
      onClick={() => navigate(generatePath(ROUTE_PATHS.PROJECT_BOQ, { projectId }))}
    />
  );
};

export default ProjectPurchaseCreateButton;
