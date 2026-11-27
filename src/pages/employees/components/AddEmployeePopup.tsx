import { Box } from "@mui/material";
import { type FC, useRef, useState } from "react";
import { useStyles } from "./AddEmployeePopup.style";
import TextField from "../../../components/TextField/TextField";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { canSubmitEmployeeForm } from "../../../utilities/employee.utility";
import { useAddEmployeeMutation } from "../../../hooks/mutations/user.mutation";
import type { IEmployeeFormValues } from "../../../interfaces/employee.interface";
import { createPasswordConfirmationValidator } from "../../../utilities/validators";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { EMPLOYEES_COPY, EMPTY_EMPLOYEE_FORM } from "../../../constants/employee.constant";
import RoleAssignmentFields from "../../../components/RoleAssignmentFields/RoleAssignmentFields";

interface IAddEmployeePopupProps {
  onClose: () => void;
}

const AddEmployeePopup: FC<IAddEmployeePopupProps> = ({ onClose }) => {
  const styles = useStyles();
  const nameRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<IEmployeeFormValues>(EMPTY_EMPLOYEE_FORM);
  const validateConfirmation = createPasswordConfirmationValidator(values.password);
  const addMutation = useAddEmployeeMutation();

  const updateValues = (changes: Partial<IEmployeeFormValues>) =>
    setValues(current => ({ ...current, ...changes }));

  return (
    <GenericPopup
      open
      onClose={onClose}
      initialFocusRef={nameRef}
      title={EMPLOYEES_COPY.ADD_TITLE}
      closeDisabled={addMutation.isPending}
      getActionErrorMessage={getApiErrorMessage}
      buttons={{
        secondary: { text: EMPLOYEES_COPY.CANCEL, isDisabled: addMutation.isPending },
        primary: {
          text: EMPLOYEES_COPY.ADD_BUTTON,
          onClick: () => addMutation.mutateAsync(values),
          isDisabled: addMutation.isPending || !canSubmitEmployeeForm(values),
        },
      }}
      content={
        <Box sx={styles.form}>
          <TextField
            compact
            inputRef={nameRef}
            isRequired
            value={values.name}
            type={FIELD_TYPES.TEXT}
            title={EMPLOYEES_COPY.NAME_LABEL}
            titleHint={EMPLOYEES_COPY.NAME_HINT}
            onChange={name => updateValues({ name })}
            placeholder={EMPLOYEES_COPY.NAME_PLACEHOLDER}
          />
          <Box sx={styles.fields}>
            <TextField
              compact
              isRequired
              value={values.email}
              type={FIELD_TYPES.EMAIL}
              title={EMPLOYEES_COPY.EMAIL_LABEL}
              onChange={email => updateValues({ email })}
              placeholder={EMPLOYEES_COPY.EMAIL_PLACEHOLDER}
            />
            <TextField
              compact
              isRequired
              value={values.phone}
              type={FIELD_TYPES.PHONE}
              title={EMPLOYEES_COPY.PHONE_LABEL}
              onChange={phone => updateValues({ phone })}
              placeholder={EMPLOYEES_COPY.PHONE_PLACEHOLDER}
            />
            <TextField
              compact
              isLtr
              isRequired
              value={values.password}
              type={FIELD_TYPES.PASSWORD}
              autoComplete="new-password"
              title={EMPLOYEES_COPY.PASSWORD_LABEL}
              titleHint={EMPLOYEES_COPY.PASSWORD_HINT}
              onChange={password => updateValues({ password })}
            />
            <TextField
              compact
              isLtr
              isRequired
              type={FIELD_TYPES.PASSWORD}
              autoComplete="new-password"
              validator={validateConfirmation}
              value={values.passwordConfirmation}
              title={EMPLOYEES_COPY.PASSWORD_CONFIRMATION_LABEL}
              onChange={passwordConfirmation => updateValues({ passwordConfirmation })}
            />
          </Box>
          <Box component="p" sx={styles.securityHint}>
            {EMPLOYEES_COPY.PASSWORD_SHARE_HINT}
          </Box>
          <RoleAssignmentFields
            assignedRoles={values.assignedRoles}
            onAssignedRolesChange={assignedRoles => updateValues({ assignedRoles })}
          />
        </Box>
      }
    />
  );
};

export default AddEmployeePopup;
