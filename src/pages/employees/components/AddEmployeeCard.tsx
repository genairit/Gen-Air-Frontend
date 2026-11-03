import { useState } from "react";
import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import { useStyles } from "./AddEmployeeCard.style";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";
import InlineError from "../../../components/InlineError/InlineError";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { canSubmitEmployeeForm } from "../../../utilities/employee.utility";
import { useAddEmployeeMutation } from "../../../hooks/mutations/user.mutation";
import type { IEmployeeFormValues } from "../../../interfaces/employee.interface";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { EMPLOYEES_COPY, EMPTY_EMPLOYEE_FORM } from "../../../constants/employee.constant";
import RoleAssignmentFields from "../../../components/RoleAssignmentFields/RoleAssignmentFields";

const AddEmployeeCard = () => {
  const styles = useStyles();
  const [values, setValues] = useState<IEmployeeFormValues>(EMPTY_EMPLOYEE_FORM);
  const addMutation = useAddEmployeeMutation();

  const updateValues = (changes: Partial<IEmployeeFormValues>) =>
    setValues(current => ({ ...current, ...changes }));

  const handleAdd = () =>
    addMutation.mutate(values, { onSuccess: () => setValues(EMPTY_EMPLOYEE_FORM) });

  return (
    <Card gap="24px" sx={styles.card}>
      <CardHeader
        icon={ICON_NAMES.CUSTOMER}
        title={EMPLOYEES_COPY.ADD_TITLE}
        subtitle={EMPLOYEES_COPY.ADD_SUBTITLE}
      />
      <Box sx={styles.sections}>
        <Box component="section" sx={styles.accountSection}>
          <Box component="h2" sx={styles.sectionTitle}>
            {EMPLOYEES_COPY.ACCOUNT_SECTION_TITLE}
          </Box>
          <Box sx={styles.fields}>
            <TextField
              isRequired
              value={values.name}
              type={FIELD_TYPES.TEXT}
              title={EMPLOYEES_COPY.NAME_LABEL}
              titleHint={EMPLOYEES_COPY.NAME_HINT}
              onChange={name => updateValues({ name })}
              placeholder={EMPLOYEES_COPY.NAME_PLACEHOLDER}
            />
            <TextField
              isRequired
              value={values.email}
              type={FIELD_TYPES.EMAIL}
              title={EMPLOYEES_COPY.EMAIL_LABEL}
              onChange={email => updateValues({ email })}
              placeholder={EMPLOYEES_COPY.EMAIL_PLACEHOLDER}
            />
            <TextField
              isRequired
              value={values.phone}
              type={FIELD_TYPES.PHONE}
              title={EMPLOYEES_COPY.PHONE_LABEL}
              onChange={phone => updateValues({ phone })}
              placeholder={EMPLOYEES_COPY.PHONE_PLACEHOLDER}
            />
            <TextField
              isRequired
              value={values.password}
              type={FIELD_TYPES.PASSWORD}
              title={EMPLOYEES_COPY.PASSWORD_LABEL}
              titleHint={EMPLOYEES_COPY.PASSWORD_HINT}
              onChange={password => updateValues({ password })}
            />
          </Box>
        </Box>
        <Box component="section" sx={styles.accessSection}>
          <Box component="h2" sx={styles.sectionTitle}>
            {EMPLOYEES_COPY.ACCESS_SECTION_TITLE}
          </Box>
          <RoleAssignmentFields
            columns={3}
            activeRole={values.role}
            assignedRoles={values.assignedRoles}
            onActiveRoleChange={role => updateValues({ role })}
            onAssignedRolesChange={assignedRoles => updateValues({ assignedRoles })}
          />
        </Box>
      </Box>
      <Box sx={styles.footer}>
        {addMutation.isError && <InlineError message={getApiErrorMessage(addMutation.error)} />}
        <Button
          onClick={handleAdd}
          icon={ICON_NAMES.ADD}
          sx={styles.submitButton}
          text={EMPLOYEES_COPY.ADD_BUTTON}
          isLoading={addMutation.isPending}
          disabled={!canSubmitEmployeeForm(values)}
        />
      </Box>
    </Card>
  );
};

export default AddEmployeeCard;
