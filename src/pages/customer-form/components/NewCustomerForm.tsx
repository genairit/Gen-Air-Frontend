import {
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

import {
  normalizeCustomerForm,
  getCustomerFormErrors,
  countCustomerFormErrors,
} from "../../../utilities/customer-form.utility";

import {
  CUSTOMER_FORM_COPY,
  EMPTY_CUSTOMER_FORM,
  CUSTOMER_TYPE_OPTIONS,
  CUSTOMER_CONTACT_FIELDS,
  CUSTOMER_IDENTITY_FIELDS,
} from "../../../constants/customer-form.constant";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import CustomerFieldsCard from "./CustomerFieldsCard";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CustomerSaveSummaryCard from "./CustomerSaveSummaryCard";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import { buildCustomerPath } from "../../../utilities/route.utility";
import InlineError from "../../../components/InlineError/InlineError";
import { isDetailFieldSet } from "../../../utilities/guards/api.guard";
import { formatFieldErrorCount } from "../../../utilities/text.utility";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import type { ICreateCustomerPayload } from "../../../interfaces/customer.interface";
import { useCreateCustomerMutation } from "../../../hooks/mutations/customer.mutation";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface INewCustomerFormProps {
  creatorName: string;
}

const NewCustomerForm: FC<INewCustomerFormProps> = ({ creatorName }) => {
  const styles = usePageStyles();
  const navigate = useNavigate();
  const [values, setValues] = useState<ICreateCustomerPayload>(EMPTY_CUSTOMER_FORM);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const mutation = useCreateCustomerMutation();

  const errors = isSubmitAttempted ? getCustomerFormErrors(values) : {};
  const errorCount = isSubmitAttempted ? countCustomerFormErrors(values) : 0;

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
    setIsSubmitAttempted(true);

    if (countCustomerFormErrors(values) > 0 || mutation.isPending) {
      return;
    }

    mutation.mutate(normalizeCustomerForm(values), {
      onSuccess: id => navigate(buildCustomerPath(id)),
    });
  };

  return (
    <Box sx={styles.page}>
      <CustomerFieldsCard
        errors={errors}
        values={values}
        onChange={updateValues}
        icon={ICON_NAMES.CUSTOMER}
        disabled={mutation.isPending}
        fields={CUSTOMER_IDENTITY_FIELDS}
        title={CUSTOMER_FORM_COPY.IDENTITY}
        subtitle={CUSTOMER_FORM_COPY.IDENTITY_SUBTITLE}
      >
        <Autocomplete
          isRequired
          onChange={changeType}
          isAutocomplete={false}
          disabled={mutation.isPending}
          title={CUSTOMER_FORM_COPY.TYPE}
          options={getOptionLabels(CUSTOMER_TYPE_OPTIONS)}
          value={findOptionLabelById(CUSTOMER_TYPE_OPTIONS, values.customerType)}
        />
      </CustomerFieldsCard>
      <CustomerFieldsCard
        errors={errors}
        values={values}
        onChange={updateValues}
        icon={ICON_NAMES.CONTACTS}
        disabled={mutation.isPending}
        fields={CUSTOMER_CONTACT_FIELDS}
        title={CUSTOMER_FORM_COPY.CONTACT}
        subtitle={CUSTOMER_FORM_COPY.CONTACT_SUBTITLE}
      />
      <CustomerSaveSummaryCard creatorName={creatorName} />
      {errorCount > 0 && <InlineError message={formatFieldErrorCount(errorCount)} />}
      {mutation.isError && <InlineError message={getApiErrorMessage(mutation.error)} />}
      <Box sx={styles.endRow}>
        <Button
          disabled={mutation.isPending}
          text={CUSTOMER_FORM_COPY.CANCEL}
          variant={BUTTON_VARIANTS.NEUTRAL}
          onClick={() => navigate(ROUTE_PATHS.CUSTOMERS)}
        />
        <Button
          onClick={save}
          icon={ICON_NAMES.SAVE}
          text={CUSTOMER_FORM_COPY.SAVE}
          isLoading={mutation.isPending}
        />
      </Box>
    </Box>
  );
};

export default NewCustomerForm;
