import {
  CUSTOMER_CONTACT_COPY,
  CUSTOMER_CONTACT_FIELDS,
  CUSTOMER_CONTACT_ROLE_SUGGESTIONS,
} from "../../constants/customer-contact.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import InlineError from "../InlineError/InlineError";
import { useStyles } from "./CustomerContacts.style";
import { usePageStyles } from "../../pages/page.style";
import { toErrorValidator } from "../../utilities/field-feedback.utility";
import { BUTTON_SIZES, BUTTON_VARIANTS } from "../Button/constants/button.constants";
import { getCustomerContactFieldErrors } from "../../utilities/customer-contact.utility";
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
  const contactStyles = useStyles();
  const fieldErrors = getCustomerContactFieldErrors(values);
  const errors = Object.values(fieldErrors).filter(error => error !== null);
  const fields = CUSTOMER_CONTACT_FIELDS.map(field => ({
    ...field,
    validator: toErrorValidator(fieldErrors[field.field]),
  }));
  const isDisabled = busy || errors.length > 0;
  const validationError = errors.join(" · ");
  const roleOptions = CUSTOMER_CONTACT_ROLE_SUGGESTIONS.map(role => ({
    role,
    variant: values.role === role ? BUTTON_VARIANTS.PRESSED : BUTTON_VARIANTS.NEUTRAL,
    onSelect: () => onChange({ ...values, role }),
  }));
  return (
    <Box sx={contactStyles.editor}>
      <Box component="b">{CUSTOMER_CONTACT_COPY.EDITOR_TITLE}</Box>
      <Box sx={contactStyles.fields}>
        {fields.map(field => (
          <TextField
            disabled={busy}
            key={field.field}
            type={field.type}
            title={field.label}
            isLtr={field.isLtr}
            validator={field.validator}
            value={values[field.field]}
            isRequired={field.required}
            maxLength={field.maxLength}
            onChange={value => onChange({ ...values, [field.field]: value })}
          />
        ))}
      </Box>
      <Box sx={styles.row({ gap: "8px" })}>
        <Box component="span" sx={contactStyles.caption}>
          {CUSTOMER_CONTACT_COPY.COMMON_ROLES}
        </Box>
        {roleOptions.map(option => (
          <Button
            disabled={busy}
            key={option.role}
            text={option.role}
            variant={option.variant}
            onClick={option.onSelect}
            size={BUTTON_SIZES.COMPACT}
          />
        ))}
      </Box>
      {validationError && <InlineError message={validationError} />}
      {error && <InlineError message={error} />}
      <Box sx={styles.row({})}>
        <Button
          onClick={onSave}
          isLoading={busy}
          disabled={isDisabled}
          size={BUTTON_SIZES.COMPACT}
          text={CUSTOMER_CONTACT_COPY.SAVE}
        />
        <Button
          disabled={busy}
          onClick={onCancel}
          size={BUTTON_SIZES.COMPACT}
          variant={BUTTON_VARIANTS.NEUTRAL}
          text={CUSTOMER_CONTACT_COPY.CANCEL}
        />
      </Box>
    </Box>
  );
};
export default CustomerContactEditor;
