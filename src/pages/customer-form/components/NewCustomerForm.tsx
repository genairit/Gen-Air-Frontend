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

import {
  PAYMENT_CONFIGURATION_COPY,
  CUSTOMER_PAYMENT_TERMS_VALUES,
} from "../../../constants/payment-configuration.constant";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import Card from "../../../components/Card/Card";
import { usePageStyles } from "../../page.style";
import { useStyles } from "./NewCustomerForm.style";
import CustomerFieldsCard from "./CustomerFieldsCard";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CustomerSaveSummaryCard from "./CustomerSaveSummaryCard";
import InlineError from "../../../components/InlineError/InlineError";
import { isDetailFieldSet } from "../../../utilities/guards/api.guard";
import { formatFieldErrorCount } from "../../../utilities/text.utility";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import type { ICreateCustomerPayload } from "../../../interfaces/customer.interface";
import { useCreateCustomerMutation } from "../../../hooks/mutations/customer.mutation";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { customerPaymentConfiguration } from "../../../utilities/payment-configuration.utility";
import PaymentConfigurationEditor from "../../../components/PaymentConfigurationEditor/PaymentConfigurationEditor";

interface INewCustomerFormProps {
  creatorName: string;
  onCancel: () => void;
  onCreated: (customerId: string) => void;
}

const NewCustomerForm: FC<INewCustomerFormProps> = ({ creatorName, onCreated, onCancel }) => {
  const styles = usePageStyles();
  const formStyles = useStyles();
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
      onSuccess: onCreated,
    });
  };

  return (
    <Box sx={{ ...styles.page, ...formStyles.form }}>
      <CustomerFieldsCard
        errors={errors}
        values={values}
        minColumnWidth={320}
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
        minColumnWidth={250}
        onChange={updateValues}
        icon={ICON_NAMES.CONTACTS}
        disabled={mutation.isPending}
        fields={CUSTOMER_CONTACT_FIELDS}
        title={CUSTOMER_FORM_COPY.CONTACT}
        subtitle={CUSTOMER_FORM_COPY.CONTACT_SUBTITLE}
      />
      <Box sx={formStyles.summaryRow}>
        <Card>
          <Box component="h2">{PAYMENT_CONFIGURATION_COPY.DEFAULT_TITLE}</Box>
          <PaymentConfigurationEditor
            allowUnset
            onChange={updateValues}
            disabled={mutation.isPending}
            value={customerPaymentConfiguration(values)}
            termsOptions={CUSTOMER_PAYMENT_TERMS_VALUES}
            customLabel={PAYMENT_CONFIGURATION_COPY.CUSTOM}
          />
        </Card>
        <CustomerSaveSummaryCard creatorName={creatorName} />
      </Box>
      {errorCount > 0 && <InlineError message={formatFieldErrorCount(errorCount)} />}
      {mutation.isError && <InlineError message={getApiErrorMessage(mutation.error)} />}
      <Box sx={styles.endRow}>
        <Button
          onClick={onCancel}
          disabled={mutation.isPending}
          text={CUSTOMER_FORM_COPY.CANCEL}
          variant={BUTTON_VARIANTS.NEUTRAL}
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
