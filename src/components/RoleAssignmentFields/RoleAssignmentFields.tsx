import {
  USER_ROLE_LABELS,
  type UserRoleType,
  ASSIGNABLE_USER_ROLE_VALUES,
} from "../../constants/user-role.constant";

import { useId, type FC } from "react";
import FieldLabel from "../FieldLabel/FieldLabel";
import InlineError from "../InlineError/InlineError";
import { useStyles } from "./RoleAssignmentFields.style";
import { Box, Chip, Autocomplete, TextField } from "@mui/material";
import { getAssignableRoles } from "../../utilities/user-role.utility";
import { EMPLOYEES_COPY, MAX_VISIBLE_ROLE_CHIPS } from "../../constants/employee.constant";

interface IRoleAssignmentFieldsProps {
  assignedRoles: UserRoleType[];
  onAssignedRolesChange: (roles: UserRoleType[]) => void;
}

const RoleAssignmentFields: FC<IRoleAssignmentFieldsProps> = ({
  assignedRoles,
  onAssignedRolesChange,
}) => {
  const styles = useStyles();
  const inputId = useId();
  const errorId = useId();
  const selectableRoles = getAssignableRoles(assignedRoles);
  const hasNoRoles = selectableRoles.length === 0;

  return (
    <Box sx={styles.container}>
      <FieldLabel
        isRequired
        htmlFor={inputId}
        hasError={hasNoRoles}
        title={EMPLOYEES_COPY.ROLE_LABEL}
      />
      <Autocomplete
        multiple
        openOnFocus
        id={inputId}
        size="small"
        openText="פתיחה"
        closeText="סגירה"
        clearText="ניקוי"
        sx={styles.picker}
        disableCloseOnSelect
        value={selectableRoles}
        options={ASSIGNABLE_USER_ROLE_VALUES}
        getOptionLabel={role => USER_ROLE_LABELS[role]}
        noOptionsText={EMPLOYEES_COPY.NO_MATCHING_ROLES}
        onChange={(_, roles) => onAssignedRolesChange(roles)}
        renderInput={params => (
          <TextField
            {...params}
            error={hasNoRoles}
            placeholder={EMPLOYEES_COPY.ROLE_SEARCH}
            slotProps={{
              ...params.slotProps,
              htmlInput: {
                ...params.slotProps.htmlInput,
                "aria-required": true,
                ...(hasNoRoles && { "aria-describedby": errorId }),
              },
            }}
          />
        )}
        renderValue={(roles, getItemProps, { expanded }) => {
          const visibleRoles = expanded ? roles : roles.slice(0, MAX_VISIBLE_ROLE_CHIPS);
          const remaining = roles.length - visibleRoles.length;
          return (
            <>
              {visibleRoles.map((role, index) => {
                const { key, ...chipProps } = getItemProps({ index });
                return (
                  <Chip key={key} size="small" label={USER_ROLE_LABELS[role]} {...chipProps} />
                );
              })}
              {remaining > 0 && (
                <Box component="bdi" dir="ltr">
                  +{remaining}
                </Box>
              )}
            </>
          );
        }}
      />
      {hasNoRoles && (
        <Box id={errorId}>
          <InlineError message={EMPLOYEES_COPY.ROLE_ASSIGNMENT_REQUIRED} />
        </Box>
      )}
    </Box>
  );
};

export default RoleAssignmentFields;
