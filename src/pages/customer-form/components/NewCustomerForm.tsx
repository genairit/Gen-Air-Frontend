import {
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

import {
  normalizeCustomerForm,
  getCustomerFormErrors,
} from "../../../utilities/customer-form.utility";

import {
  CUSTOMER_FORM_COPY,
  EMPTY_CUSTOMER_FORM,
  CUSTOMER_TYPE_OPTIONS,
  CUSTOMER_CONTACT_FIELDS,
  CUSTOMER_IDENTITY_FIELDS,
} from "../../../constants/customer-form.constant";

import { useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import CustomerFieldsCard from "./CustomerFieldsCard";
import Button from "../../../components/Button/Button";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import { buildCustomerPath } from "../../../utilities/route.utility";
import InlineError from "../../../components/InlineError/InlineError";
import { isDetailFieldSet } from "../../../utilities/guards/api.guard";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import type { ICreateCustomerPayload } from "../../../interfaces/customer.interface";
import { useCreateCustomerMutation } from "../../../hooks/mutations/customer.mutation";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

const NewCustomerForm = () => {
  const styles = usePageStyles();
  const navigate = useNavigate();
  const [values, setValues] = useState<ICreateCustomerPayload>(EMPTY_CUSTOMER_FORM);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const mutation = useCreateCustomerMutation();
  const hasErrors = Object.keys(getCustomerFormErrors(values)).length > 0;
  const showErrors = submitAttempted && hasErrors;
  const updateValues = (changes: Partial<ICreateCustomerPayload>) =>
    setValues(current => ({ ...current, ...changes }));
  const changeType = (label: string | null) => {
    const customerType = findOptionIdByLabel(CUSTOMER_TYPE_OPTIONS, label);
    if (!isDetailFieldSet(customerType)) {
      return;
    }

    updateValues({ customerType });
  };
  const save = () => {
    setSubmitAttempted(true);
    if (hasErrors || mutation.isPending) {
      return;
    }

    mutation.mutate(normalizeCustomerForm(values), {
      onSuccess: id => navigate(buildCustomerPath(id)),
    });
  };
  return (
    <Box sx={styles.page}>
      <Autocomplete
        isRequired
        onChange={changeType}
        isAutocomplete={false}
        disabled={mutation.isPending}
        title={CUSTOMER_FORM_COPY.TYPE}
        options={getOptionLabels(CUSTOMER_TYPE_OPTIONS)}
        value={findOptionLabelById(CUSTOMER_TYPE_OPTIONS, values.customerType)}
      />
      <CustomerFieldsCard
        values={values}
        onChange={updateValues}
        disabled={mutation.isPending}
        fields={CUSTOMER_IDENTITY_FIELDS}
        title={CUSTOMER_FORM_COPY.IDENTITY}
      />
      <CustomerFieldsCard
        values={values}
        onChange={updateValues}
        disabled={mutation.isPending}
        fields={CUSTOMER_CONTACT_FIELDS}
        title={CUSTOMER_FORM_COPY.CONTACT}
      />
      {showErrors && <InlineError message={CUSTOMER_FORM_COPY.INVALID} />}
      {mutation.error && <InlineError message={getApiErrorMessage(mutation.error)} />}
      <Box sx={styles.row({})}>
        <Button onClick={save} text={CUSTOMER_FORM_COPY.SAVE} isLoading={mutation.isPending} />
        <Button
          disabled={mutation.isPending}
          text={CUSTOMER_FORM_COPY.CANCEL}
          variant={BUTTON_VARIANTS.NEUTRAL}
          onClick={() => navigate(ROUTE_PATHS.CUSTOMERS)}
        />
      </Box>
    </Box>
  );
};
export default NewCustomerForm;
