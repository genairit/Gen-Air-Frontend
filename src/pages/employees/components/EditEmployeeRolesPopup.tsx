import { Box } from "@mui/material";
import { type FC, useState } from "react";
import InlineError from "../../../components/InlineError/InlineError";
import { EMPLOYEES_COPY } from "../../../constants/employee.constant";
import type { IEmployee } from "../../../interfaces/employee.interface";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import type { UserRoleType } from "../../../constants/user-role.constant";
import { getActiveEmployeeRole } from "../../../utilities/employee.utility";
import { useUpdateEmployeeRolesMutation } from "../../../hooks/mutations/user.mutation";
import RoleAssignmentFields from "../../../components/RoleAssignmentFields/RoleAssignmentFields";

interface IEditEmployeeRolesPopupProps {
  employee: IEmployee;
  onClose: () => void;
}

const EditEmployeeRolesPopup: FC<IEditEmployeeRolesPopupProps> = ({ employee, onClose }) => {
  const [activeRole, setActiveRole] = useState<UserRoleType | null>(employee.role);
  const [assignedRoles, setAssignedRoles] = useState(employee.assignedRoles);
  const updateMutation = useUpdateEmployeeRolesMutation();
  const nextActiveRole = getActiveEmployeeRole({ role: activeRole, assignedRoles });
  const hasAssignedRoles = assignedRoles.length > 0;
  const hasValidActiveRole = nextActiveRole !== null && assignedRoles.includes(nextActiveRole);
  const canSave = !updateMutation.isPending && hasAssignedRoles && hasValidActiveRole;
  const isSaveDisabled = !canSave;

  const saveRoleChanges = async (): Promise<void> => {
    if (!nextActiveRole) {
      return;
    }

    await updateMutation.mutateAsync({
      userId: employee.id,
      changes: { assignedRoles, role: nextActiveRole },
    });
  };

  return (
    <GenericPopup
      open
      onClose={onClose}
      title={EMPLOYEES_COPY.EDIT_ROLES_TITLE}
      buttons={{
        primary: {
          text: EMPLOYEES_COPY.SAVE_ROLE_CHANGES,
          isDisabled: isSaveDisabled,
          onClick: saveRoleChanges,
        },
        secondary: {
          text: EMPLOYEES_COPY.CANCEL,
          onClick: onClose,
        },
      }}
      content={
        <Box>
          <RoleAssignmentFields
            activeRole={activeRole}
            assignedRoles={assignedRoles}
            onActiveRoleChange={setActiveRole}
            onAssignedRolesChange={setAssignedRoles}
          />
          {updateMutation.error && (
            <InlineError message={getApiErrorMessage(updateMutation.error)} />
          )}
        </Box>
      }
    />
  );
};

export default EditEmployeeRolesPopup;
