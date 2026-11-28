import {
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

import {
  customerFormValues,
  getCustomerFormErrors,
  getCustomerEditErrors,
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
import { useStyles } from "./CustomerForm.style";
import CustomerFormStep from "./CustomerFormStep";
import CustomerFieldsCard from "./CustomerFieldsCard";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CustomerSaveSummaryCard from "./CustomerSaveSummaryCard";
import InlineError from "../../../components/InlineError/InlineError";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import { isDetailFieldSet } from "../../../utilities/guards/api.guard";
import { formatFieldErrorCount } from "../../../utilities/text.utility";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import type { ICreateCustomerPayload } from "../../../interfaces/customer.interface";
import { useSaveCustomerMutation } from "../../../hooks/mutations/customer.mutation";
import { customerPaymentConfiguration } from "../../../utilities/payment-configuration.utility";
import PaymentConfigurationEditor from "../../../components/PaymentConfigurationEditor/PaymentConfigurationEditor";

interface ICustomerFormProps {
  popup?: boolean;
  creatorName?: string;
  onCancel: () => void;
  customer?: IApiCustomer;
  onSaved: (customerId: string) => void;
}

const CustomerForm: FC<ICustomerFormProps> = ({
  popup = false,
  creatorName,
  customer,
  onSaved,
  onCancel,
}) => {
  const styles = usePageStyles();
  const formStyles = useStyles();
  const [original] = useState(customer ?? null);
  const [values, setValues] = useState<ICreateCustomerPayload>(() =>
    original ? customerFormValues(original) : EMPTY_CUSTOMER_FORM,
  );
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const mutation = useSaveCustomerMutation(original);
  const currentErrors = original
    ? getCustomerEditErrors(original, values)
    : getCustomerFormErrors(values);
  const errors = isSubmitAttempted ? currentErrors : {};
  const errorCount = Object.keys(errors).length;

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

    if (Object.keys(currentErrors).length > 0 || mutation.isPending) {
      return;
    }

    mutation.mutate(values, { onSuccess: onSaved });
  };

  const PaymentSection = popup ? "section" : Card;
  const summaryStyle = popup ? styles.page : formStyles.summaryRow;
  const sectionTitleStyle = popup ? formStyles.sectionTitle : {};
  const title = original ? CUSTOMER_FORM_COPY.EDIT : CUSTOMER_FORM_COPY.TITLE;
  const fields = (
    <Box sx={{ ...styles.page, ...formStyles.form }}>
      <CustomerFieldsCard
        compact={popup}
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
        compact={popup}
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
      <Box sx={summaryStyle}>
        <PaymentSection>
          <Box component="h2" sx={sectionTitleStyle}>
            {PAYMENT_CONFIGURATION_COPY.DEFAULT_TITLE}
          </Box>
          <PaymentConfigurationEditor
            allowUnset
            onChange={updateValues}
            disabled={mutation.isPending}
            value={customerPaymentConfiguration(values)}
            termsOptions={CUSTOMER_PAYMENT_TERMS_VALUES}
            customLabel={PAYMENT_CONFIGURATION_COPY.CUSTOM}
          />
        </PaymentSection>
        {creatorName != null && <CustomerSaveSummaryCard creatorName={creatorName} />}
      </Box>
      {errorCount > 0 && <InlineError message={formatFieldErrorCount(errorCount)} />}
      {mutation.isError && <InlineError message={getApiErrorMessage(mutation.error)} />}
    </Box>
  );
  return (
    <CustomerFormStep
      popup={popup}
      onSave={save}
      title={title}
      onCancel={onCancel}
      busy={mutation.isPending}
      saveIcon={ICON_NAMES.SAVE}
      saveText={CUSTOMER_FORM_COPY.SAVE}
      cancelText={CUSTOMER_FORM_COPY.CANCEL}
    >
      {fields}
    </CustomerFormStep>
  );
};

export default CustomerForm;
