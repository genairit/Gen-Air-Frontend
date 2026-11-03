import {
  USER_ROLE_VALUES,
  USER_ROLE_LABELS,
  type UserRoleType,
} from "../../constants/user-role.constant";

import { Box } from "@mui/material";
import { useId, type FC } from "react";
import CheckBox from "../CheckBox/CheckBox";
import FieldLabel from "../FieldLabel/FieldLabel";
import RadioButton from "../RadioButton/RadioButton";
import InlineError from "../InlineError/InlineError";
import { useStyles } from "./RoleAssignmentFields.style";
import { EMPLOYEES_COPY } from "../../constants/employee.constant";

interface IRoleAssignmentFieldsProps {
  columns?: 2 | 3;
  assignedRoles: UserRoleType[];
  activeRole: UserRoleType | null;
  onAssignedRolesChange: (roles: UserRoleType[]) => void;
  onActiveRoleChange: (role: UserRoleType | null) => void;
}

const RoleAssignmentFields: FC<IRoleAssignmentFieldsProps> = ({
  columns = 2,
  activeRole,
  assignedRoles,
  onActiveRoleChange,
  onAssignedRolesChange,
}) => {
  const styles = useStyles();
  const radioGroupName = useId();
  const activeRoleDescriptionId = `${radioGroupName}-description`;
  const hasMultipleRoles = assignedRoles.length > 1;
  const hasNoRoles = assignedRoles.length === 0;
  const soleAssignedRole = assignedRoles.length === 1 ? (assignedRoles[0] ?? null) : null;
  const roleOptions = USER_ROLE_VALUES.map(role => ({
    role,
    label: USER_ROLE_LABELS[role],
    isActive: activeRole === role,
    isAssigned: assignedRoles.includes(role),
    isSoleActive: soleAssignedRole === role,
  }));

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
    <Box sx={styles.container}>
      <FieldLabel isRequired title={EMPLOYEES_COPY.ROLE_LABEL} />
      {hasMultipleRoles && (
        <Box component="span" sx={styles.visuallyHidden} id={activeRoleDescriptionId}>
          {EMPLOYEES_COPY.ACTIVE_ROLE_LABEL}
        </Box>
      )}
      <Box role="group" sx={styles.roleGrid({ columns })} aria-label={EMPLOYEES_COPY.ROLE_LABEL}>
        {roleOptions.map(({ role, label, isAssigned, isSoleActive, isActive }) => (
          <Box key={role} sx={styles.roleOption({ isSelected: isAssigned })}>
            <CheckBox
              text={label}
              value={isAssigned}
              onChange={isSelected => updateRoleSelection(role, isSelected)}
            />
            {isSoleActive && (
              <Box component="span" sx={styles.activeBadge}>
                {EMPLOYEES_COPY.ACTIVE_ROLE_STATUS}
              </Box>
            )}
            {hasMultipleRoles && isAssigned && (
              <RadioButton
                value={role}
                ariaLabel={label}
                checked={isActive}
                name={radioGroupName}
                ariaDescribedBy={activeRoleDescriptionId}
                label={EMPLOYEES_COPY.ACTIVE_ROLE_STATUS}
                onSelect={() => onActiveRoleChange(role)}
              />
            )}
          </Box>
        ))}
      </Box>
      {hasNoRoles && <InlineError message={EMPLOYEES_COPY.ROLE_ASSIGNMENT_REQUIRED} />}
    </Box>
  );
};

export default RoleAssignmentFields;
