import {
  CUSTOMER_CONTACT_COPY,
  CUSTOMER_CONTACT_FIELDS,
} from "../../constants/customer-contact.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import InlineError from "../InlineError/InlineError";
import { usePageStyles } from "../../pages/page.style";
import { BUTTON_VARIANTS } from "../Button/constants/button.constants";
import { validateCustomerContactDraft } from "../../utilities/customer-contact.utility";
import type { ICustomerContactDraft } from "../../interfaces/customer-contact.interface";

interface ICustomerContactEditorProps {
  busy: boolean;
  onSave: () => void;
  onCancel: () => void;
  error: string | null;
  values: ICustomerContactDraft;
  onChange: (values: ICustomerContactDraft) => void;
}

const CustomerContactEditor: FC<ICustomerContactEditorProps> = ({
  busy,
  error,
  values,
  onSave,
  onCancel,
  onChange,
}) => {
  const styles = usePageStyles();
  const errors = validateCustomerContactDraft(values);
  const isDisabled = busy || errors.length > 0;
  const validationError = errors.join(" · ");
  return (
    <Box sx={styles.stack({})}>
      {CUSTOMER_CONTACT_FIELDS.map(field => (
        <TextField
          disabled={busy}
          key={field.field}
          type={field.type}
          title={field.label}
          isLtr={field.isLtr}
          value={values[field.field]}
          isRequired={field.required}
          maxLength={field.maxLength}
          onChange={value => onChange({ ...values, [field.field]: value })}
        />
      ))}
      {validationError && <InlineError message={validationError} />}
      {error && <InlineError message={error} />}
      <Box sx={styles.row({})}>
        <Button
          onClick={onSave}
          isLoading={busy}
          disabled={isDisabled}
          text={CUSTOMER_CONTACT_COPY.SAVE}
        />
        <Button
          disabled={busy}
          onClick={onCancel}
          variant={BUTTON_VARIANTS.NEUTRAL}
          text={CUSTOMER_CONTACT_COPY.CANCEL}
        />
      </Box>
    </Box>
  );
};
export default CustomerContactEditor;
