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
  PAYMENT_TERMS_VALUES,
  PAYMENT_TERMS_LABELS,
  CUSTOMER_PAYMENT_DEFAULT_COPY,
  CUSTOMER_PAYMENT_DEFAULT_LABELS,
} from "../../../constants/payment-terms.constant";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import Card from "../../../components/Card/Card";
import { usePageStyles } from "../../page.style";
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
import type { ICustomerContact } from "../../../interfaces/customer-contact.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import DirectoryContactPicker from "../../../components/DirectoryContactPicker/DirectoryContactPicker";

interface INewCustomerFormProps {
  creatorName: string;
  onCancel: () => void;
  onCreated: (customerId: string) => void;
}

const NewCustomerForm: FC<INewCustomerFormProps> = ({ creatorName, onCreated, onCancel }) => {
  const styles = usePageStyles();
  const [values, setValues] = useState<ICreateCustomerPayload>(EMPTY_CUSTOMER_FORM);
  const [selectedContact, setSelectedContact] = useState<ICustomerContact[]>([]);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const mutation = useCreateCustomerMutation();

  const errors = isSubmitAttempted ? getCustomerFormErrors(values) : {};
  const errorCount = isSubmitAttempted ? countCustomerFormErrors(values) : 0;
  const paymentTermsLabel = values.paymentTerms
    ? PAYMENT_TERMS_LABELS[values.paymentTerms].title
    : CUSTOMER_PAYMENT_DEFAULT_COPY.NONE;

  const updateValues = (changes: Partial<ICreateCustomerPayload>) =>
    setValues(current => ({ ...current, ...changes }));

  const changeType = (label: string | null) => {
    const customerType = findOptionIdByLabel(CUSTOMER_TYPE_OPTIONS, label);

    if (!isDetailFieldSet(customerType)) {
      return;
    }

    updateValues({ customerType });
  };

  const changePaymentTerms = (label: string | null) =>
    updateValues({
      paymentTerms:
        PAYMENT_TERMS_VALUES.find(value => PAYMENT_TERMS_LABELS[value].title === label) ?? null,
    });

  const save = () => {
    setIsSubmitAttempted(true);

    if (countCustomerFormErrors(values) > 0 || mutation.isPending) {
      return;
    }

    mutation.mutate(
      {
        ...normalizeCustomerForm(values),
        primaryContactId: selectedContact[0]?.id ?? null,
      },
      {
        onSuccess: onCreated,
      },
    );
  };

  return (
    <Box sx={styles.page}>
      <Box sx={styles.grid({ minColumnWidth: 520 })}>
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
        <Box sx={styles.stack({})}>
          <DirectoryContactPicker
            title="בחר איש קשר קיים"
            selected={selectedContact}
            disabled={mutation.isPending}
            subtitle="אפשר לבחור איש קשר מהמדריך, להזין חדש או להשאיר ריק."
            onChange={contacts => {
              setSelectedContact(contacts);
              if (contacts.length) {
                updateValues({ contactName: "", phone: "", email: "" });
              }
            }}
          />
          {!selectedContact.length && (
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
          )}
        </Box>
      </Box>
      <Box sx={styles.grid({ minColumnWidth: 500 })}>
        <Card>
          <Autocomplete
            isAutocomplete={false}
            value={paymentTermsLabel}
            disabled={mutation.isPending}
            onChange={changePaymentTerms}
            title="תנאי תשלום כברירת מחדל"
            options={CUSTOMER_PAYMENT_DEFAULT_LABELS}
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
