import {
  USER_ROLE_LABELS,
  type UserRoleType,
  ASSIGNABLE_USER_ROLE_VALUES,
} from "../../constants/user-role.constant";

import { Box } from "@mui/material";
import { useId, type FC } from "react";
import CheckBox from "../CheckBox/CheckBox";
import FieldLabel from "../FieldLabel/FieldLabel";
import InlineError from "../InlineError/InlineError";
import { useStyles } from "./RoleAssignmentFields.style";
import { EMPLOYEES_COPY } from "../../constants/employee.constant";

interface IRoleAssignmentFieldsProps {
  columns?: 2 | 3;
  assignedRoles: UserRoleType[];
  onAssignedRolesChange: (roles: UserRoleType[]) => void;
}

const RoleAssignmentFields: FC<IRoleAssignmentFieldsProps> = ({
  columns = 2,
  assignedRoles,
  onAssignedRolesChange,
}) => {
  const styles = useStyles();
  const helperId = useId();
  const selectableRoles = assignedRoles.filter(role => ASSIGNABLE_USER_ROLE_VALUES.includes(role));
  const hasNoRoles = selectableRoles.length === 0;
  const roleOptions = ASSIGNABLE_USER_ROLE_VALUES.map(role => ({
    role,
    label: USER_ROLE_LABELS[role],
    isAssigned: assignedRoles.includes(role),
  }));

  const updateRoleSelection = (role: UserRoleType, isSelected: boolean): void => {
    const updatedRoles = isSelected
      ? [...selectableRoles, role]
      : selectableRoles.filter(assignedRole => assignedRole !== role);
    onAssignedRolesChange(updatedRoles);
  };

  return (
    <Box sx={styles.container}>
      <FieldLabel isRequired title={EMPLOYEES_COPY.ROLE_LABEL} />
      <Box id={helperId} component="span" sx={styles.helper}>
        {EMPLOYEES_COPY.ROLE_ASSIGNMENT_HELPER}
      </Box>
      <Box
        role="group"
        aria-describedby={helperId}
        sx={styles.roleGrid({ columns })}
        aria-label={EMPLOYEES_COPY.ROLE_LABEL}
      >
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
      {hasNoRoles && <InlineError message={EMPLOYEES_COPY.ROLE_ASSIGNMENT_REQUIRED} />}
    </Box>
  );
};

export default RoleAssignmentFields;
