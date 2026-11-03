import {
  USER_ROLE_VALUES,
  USER_ROLE_LABELS,
  type UserRoleType,
} from "../../constants/user-role.constant";

import { Box } from "@mui/material";
import { useId, type FC } from "react";
import CheckBox from "../CheckBox/CheckBox";
import RadioButton from "../RadioButton/RadioButton";
import InlineError from "../InlineError/InlineError";
import { usePageStyles } from "../../pages/page.style";
import { EMPLOYEES_COPY } from "../../constants/employee.constant";

interface IRoleAssignmentFieldsProps {
  assignedRoles: UserRoleType[];
  activeRole: UserRoleType | null;
  onAssignedRolesChange: (roles: UserRoleType[]) => void;
  onActiveRoleChange: (role: UserRoleType | null) => void;
}

const RoleAssignmentFields: FC<IRoleAssignmentFieldsProps> = ({
  activeRole,
  assignedRoles,
  onActiveRoleChange,
  onAssignedRolesChange,
}) => {
  const styles = usePageStyles();
  const radioGroupName = useId();
  const hasMultipleRoles = assignedRoles.length > 1;
  const hasNoRoles = assignedRoles.length === 0;
  const roleOptions = USER_ROLE_VALUES.map(role => ({
    role,
    label: USER_ROLE_LABELS[role],
    isAssigned: assignedRoles.includes(role),
  }));
  const activeRoleOptions = roleOptions.filter(option => option.isAssigned);

  const updateRoleSelection = (role: UserRoleType, isSelected: boolean): void => {
    const updatedRoles = isSelected
      ? [...assignedRoles, role]
      : assignedRoles.filter(assignedRole => assignedRole !== role);
    onAssignedRolesChange(updatedRoles);

    if (!isSelected && activeRole === role) {
      onActiveRoleChange(null);
    }
  };

  return (
    <Box sx={styles.stack({ gap: "14px" })}>
      <Box sx={styles.grid({ minColumnWidth: 190, gap: "10px" })}>
        {roleOptions.map(({ role, label, isAssigned }) => (
          <CheckBox
            key={role}
            text={label}
            value={isAssigned}
            onChange={isSelected => updateRoleSelection(role, isSelected)}
          />
        ))}
      </Box>
      {hasMultipleRoles && (
        <Box
          role="radiogroup"
          sx={styles.stack({ gap: "8px" })}
          aria-label={EMPLOYEES_COPY.ACTIVE_ROLE_LABEL}
        >
          <Box component="span" sx={styles.caption}>
            {EMPLOYEES_COPY.ACTIVE_ROLE_LABEL}
          </Box>
          {activeRoleOptions.map(({ role, label }) => (
            <RadioButton
              key={role}
              value={role}
              label={label}
              name={radioGroupName}
              checked={activeRole === role}
              onSelect={() => onActiveRoleChange(role)}
            />
          ))}
        </Box>
      )}
      {hasNoRoles && <InlineError message={EMPLOYEES_COPY.ROLE_ASSIGNMENT_REQUIRED} />}
    </Box>
  );
};

export default RoleAssignmentFields;
