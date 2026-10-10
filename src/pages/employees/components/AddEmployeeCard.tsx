import {
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

import { useState } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import { isUserRole } from "../../../utilities/guards/api.guard";
import CardHeader from "../../../components/CardHeader/CardHeader";
import InlineError from "../../../components/InlineError/InlineError";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { USER_ROLE_OPTIONS } from "../../../constants/user-role.constant";
import { canSubmitEmployeeForm } from "../../../utilities/employee.utility";
import { useAddEmployeeMutation } from "../../../hooks/mutations/user.mutation";
import type { IEmployeeFormValues } from "../../../interfaces/employee.interface";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { EMPLOYEES_COPY, EMPTY_EMPLOYEE_FORM } from "../../../constants/employee.constant";

const AddEmployeeCard = () => {
  const styles = usePageStyles();
  const addMutation = useAddEmployeeMutation();
  const [values, setValues] = useState<IEmployeeFormValues>(EMPTY_EMPLOYEE_FORM);

  const updateValues = (changes: Partial<IEmployeeFormValues>) =>
    setValues(current => ({ ...current, ...changes }));

  const handleRoleChange = (label: string | null) => {
    const role = findOptionIdByLabel(USER_ROLE_OPTIONS, label);

    if (!isUserRole(role)) {
      return;
    }

    updateValues({ role });
  };

  const handleAdd = () =>
    addMutation.mutate(values, { onSuccess: () => setValues(EMPTY_EMPLOYEE_FORM) });

  return (
    <Card gap="18px">
      <CardHeader
        icon={ICON_NAMES.CUSTOMER}
        title={EMPLOYEES_COPY.ADD_TITLE}
        subtitle={EMPLOYEES_COPY.ADD_SUBTITLE}
      />
      <Box sx={[styles.grid({ minColumnWidth: 190, gap: "14px" }), styles.bottomAligned]}>
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
        <Autocomplete
          isRequired
          isAutocomplete={false}
          onChange={handleRoleChange}
          title={EMPLOYEES_COPY.ROLE_LABEL}
          options={getOptionLabels(USER_ROLE_OPTIONS)}
          value={findOptionLabelById(USER_ROLE_OPTIONS, values.role)}
        />
        <TextField
          value={values.password}
          type={FIELD_TYPES.PASSWORD}
          title={EMPLOYEES_COPY.PASSWORD_LABEL}
          titleHint={EMPLOYEES_COPY.PASSWORD_HINT}
          onChange={password => updateValues({ password })}
        />
        <Button
          onClick={handleAdd}
          icon={ICON_NAMES.ADD}
          text={EMPLOYEES_COPY.ADD_BUTTON}
          isLoading={addMutation.isPending}
          disabled={!canSubmitEmployeeForm(values)}
        />
      </Box>
      {addMutation.isError && <InlineError message={getApiErrorMessage(addMutation.error)} />}
    </Card>
  );
};

export default AddEmployeeCard;
