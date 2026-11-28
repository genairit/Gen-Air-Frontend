import { useRef } from "react";
import type { FC } from "react";
import Button from "../../../components/Button/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { useSessionUser } from "../../../store/session.store";
import { useElementFocus } from "../../../hooks/element-focus.hook";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import { BUTTON_SIZES } from "../../../components/Button/constants/button.constants";
import { buildEstimateCreatePath } from "../../../utilities/engineering-estimate.utility";

interface IProjectEstimateCreateButtonProps {
  projectId: string;
}

const ProjectEstimateCreateButton: FC<IProjectEstimateCreateButtonProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const user = useSessionUser();
  const button = useRef<HTMLButtonElement | null>(null);
  const canCreate = hasPermission(user, PERMISSIONS.ENGINEERING_ESTIMATES_MANAGE);
  useElementFocus(button, canCreate && state?.focusEstimateCreate === true);

  if (!canCreate) {
    return null;
  }

  return (
    <Button
      buttonRef={button}
      text="יצירת כתב כמויות"
      size={BUTTON_SIZES.COMPACT}
      onClick={() => navigate(buildEstimateCreatePath(projectId))}
    />
  );
};

export default ProjectEstimateCreateButton;
