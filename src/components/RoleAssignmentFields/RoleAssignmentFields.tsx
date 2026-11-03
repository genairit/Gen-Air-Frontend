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
  const styles = useStyles();
  const radioGroupName = useId();
  const hasMultipleRoles = assignedRoles.length > 1;
  const hasNoRoles = assignedRoles.length === 0;
  const soleAssignedRole = assignedRoles.length === 1 ? (assignedRoles[0] ?? null) : null;
  const soleAssignedRoleLabel =
    soleAssignedRole === null ? null : USER_ROLE_LABELS[soleAssignedRole];
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
    <Box sx={styles.container}>
      <FieldLabel isRequired title={EMPLOYEES_COPY.ROLE_LABEL} />
      <Box role="group" sx={styles.roleGrid} aria-label={EMPLOYEES_COPY.ROLE_LABEL}>
        {roleOptions.map(({ role, label, isAssigned }) => (
          <Box key={role} sx={styles.roleOption({ isSelected: isAssigned })}>
            <CheckBox
              text={label}
              value={isAssigned}
              onChange={isSelected => updateRoleSelection(role, isSelected)}
            />
          </Box>
        ))}
      </Box>
      {soleAssignedRoleLabel && (
        <Box sx={styles.activeSection}>
          <FieldLabel title={EMPLOYEES_COPY.ACTIVE_ROLE_LABEL} />
          <Box sx={styles.activeSummary}>{soleAssignedRoleLabel}</Box>
        </Box>
      )}
      {hasMultipleRoles && (
        <Box
          role="radiogroup"
          sx={styles.activeSection}
          aria-label={EMPLOYEES_COPY.ACTIVE_ROLE_LABEL}
        >
          <FieldLabel title={EMPLOYEES_COPY.ACTIVE_ROLE_LABEL} />
          <Box sx={styles.activeGrid}>
            {activeRoleOptions.map(({ role, label }) => (
              <Box key={role} sx={styles.activeOption({ isSelected: activeRole === role })}>
                <RadioButton
                  value={role}
                  label={label}
                  name={radioGroupName}
                  checked={activeRole === role}
                  onSelect={() => onActiveRoleChange(role)}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {hasNoRoles && <InlineError message={EMPLOYEES_COPY.ROLE_ASSIGNMENT_REQUIRED} />}
    </Box>
  );
};

export default RoleAssignmentFields;
