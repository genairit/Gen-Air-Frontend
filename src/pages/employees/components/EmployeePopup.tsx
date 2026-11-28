import {
  toEmployeeFormValues,
  canSubmitEmployeeForm,
  toEmployeeUpdatePayload,
  canSubmitEmployeeUpdate,
} from "../../../utilities/employee.utility";

import {
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../../../hooks/mutations/user.mutation";

import { Box } from "@mui/material";
import { type FC, useRef, useState } from "react";
import { useStyles } from "./EmployeePopup.style";
import TextField from "../../../components/TextField/TextField";
import { EMPLOYEES_COPY } from "../../../constants/employee.constant";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { createPasswordConfirmationValidator } from "../../../utilities/validators";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import type { IEmployee, IEmployeeFormValues } from "../../../interfaces/employee.interface";
import RoleAssignmentFields from "../../../components/RoleAssignmentFields/RoleAssignmentFields";

interface IEmployeePopupProps {
  onClose: () => void;
  employee: IEmployee | null;
}

const EmployeePopup: FC<IEmployeePopupProps> = ({ employee, onClose }) => {
  const styles = useStyles();
  const nameRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState(() => toEmployeeFormValues(employee));
  const validateConfirmation = createPasswordConfirmationValidator(values.password);
  const addMutation = useAddEmployeeMutation();
  const updateMutation = useUpdateEmployeeMutation();
  const changes = employee ? toEmployeeUpdatePayload(employee, values) : null;
  const isPending = addMutation.isPending || updateMutation.isPending;
  const canSubmit = changes
    ? canSubmitEmployeeUpdate(changes, values)
    : canSubmitEmployeeForm(values);
  const title = employee ? EMPLOYEES_COPY.EDIT : EMPLOYEES_COPY.ADD_TITLE;
  const submitLabel = employee ? EMPLOYEES_COPY.SAVE_CHANGES : EMPLOYEES_COPY.ADD_BUTTON;

  const saveEmployee = () =>
    employee && changes
      ? updateMutation.mutateAsync({ userId: employee.id, changes })
      : addMutation.mutateAsync(values);

  const updateValues = (changes: Partial<IEmployeeFormValues>) =>
    setValues(current => ({ ...current, ...changes }));

  return (
    <GenericPopup
      open
      title={title}
      onClose={onClose}
      initialFocusRef={nameRef}
      closeDisabled={isPending}
      getActionErrorMessage={getApiErrorMessage}
      buttons={{
        secondary: { text: EMPLOYEES_COPY.CANCEL, isDisabled: isPending },
        primary: {
          text: submitLabel,
          onClick: saveEmployee,
          isDisabled: isPending || !canSubmit,
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
          </Box>
          <RoleAssignmentFields
            assignedRoles={values.assignedRoles}
            onAssignedRolesChange={assignedRoles => updateValues({ assignedRoles })}
          />
          {!employee && (
            <>
              <Box sx={styles.fields}>
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
            </>
          )}
        </Box>
      }
    />
  );
};

export default EmployeePopup;
