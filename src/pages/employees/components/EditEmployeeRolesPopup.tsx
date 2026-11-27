import { type FC, useState } from "react";
import { EMPLOYEES_COPY } from "../../../constants/employee.constant";
import type { IEmployee } from "../../../interfaces/employee.interface";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { ASSIGNABLE_USER_ROLE_VALUES } from "../../../constants/user-role.constant";
import { useUpdateEmployeeRolesMutation } from "../../../hooks/mutations/user.mutation";
import RoleAssignmentFields from "../../../components/RoleAssignmentFields/RoleAssignmentFields";

interface IEditEmployeeRolesPopupProps {
  employee: IEmployee;
  onClose: () => void;
}

const EditEmployeeRolesPopup: FC<IEditEmployeeRolesPopupProps> = ({ employee, onClose }) => {
  const [assignedRoles, setAssignedRoles] = useState(
    employee.assignedRoles.filter(role => ASSIGNABLE_USER_ROLE_VALUES.includes(role)),
  );
  const updateMutation = useUpdateEmployeeRolesMutation();
  const hasAssignedRoles = assignedRoles.length > 0;
  const canSave = !updateMutation.isPending && hasAssignedRoles;
  const isSaveDisabled = !canSave;

  const saveRoleChanges = async (): Promise<void> => {
    await updateMutation.mutateAsync({
      userId: employee.id,
      changes: { assignedRoles },
    });
  };

  return (
    <GenericPopup
      open
      onClose={onClose}
      title={EMPLOYEES_COPY.EDIT_ROLES_TITLE}
      closeDisabled={updateMutation.isPending}
      getActionErrorMessage={getApiErrorMessage}
      content={
        <RoleAssignmentFields
          assignedRoles={assignedRoles}
          onAssignedRolesChange={setAssignedRoles}
        />
      }
      buttons={{
        primary: {
          text: EMPLOYEES_COPY.SAVE_ROLE_CHANGES,
          isDisabled: isSaveDisabled,
          onClick: saveRoleChanges,
        },
        secondary: {
          text: EMPLOYEES_COPY.CANCEL,
          isDisabled: updateMutation.isPending,
        },
      }}
    />
  );
};

export default EditEmployeeRolesPopup;
