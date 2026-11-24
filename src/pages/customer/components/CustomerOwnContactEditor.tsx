import {
  CUSTOMER_OWN_CONTACT_COPY,
  CUSTOMER_OWN_CONTACT_FIELDS,
} from "../../../constants/customer-own-contact.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import TextField from "../../../components/TextField/TextField";
import InlineError from "../../../components/InlineError/InlineError";
import { toErrorValidator } from "../../../utilities/field-feedback.utility";
import type { ICustomerOwnContactDraft } from "../../../interfaces/customer.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { getCustomerOwnContactErrors } from "../../../utilities/customer-own-contact.utility";

interface ICustomerOwnContactEditorProps {
  busy: boolean;
  onSave: () => void;
  error: string | null;
  onCancel: () => void;
  draft: ICustomerOwnContactDraft;
  onChange: (draft: ICustomerOwnContactDraft) => void;
}

const CustomerOwnContactEditor: FC<ICustomerOwnContactEditorProps> = ({
  busy,
  error,
  draft,
  onSave,
  onCancel,
  onChange,
}) => {
  const styles = usePageStyles();
  const errors = getCustomerOwnContactErrors(draft);
  const isSaveDisabled = busy || Object.keys(errors).length > 0;

  return (
    <Box sx={styles.stack({ gap: "16px" })}>
      <Box sx={styles.grid({ minColumnWidth: 240, gap: "16px" })}>
        {CUSTOMER_OWN_CONTACT_FIELDS.map(field => (
          <TextField
            disabled={busy}
            key={field.field}
            title={field.label}
            isLtr={field.isLtr}
            type={field.inputType}
            value={draft[field.field]}
            maxLength={field.maxLength}
            infoText={field.hint ?? ""}
            placeholder={field.placeholder}
            validator={toErrorValidator(errors[field.field])}
            onChange={value => onChange({ ...draft, [field.field]: value })}
          />
        ))}
      </Box>
      {error && <InlineError message={error} />}
      <Box sx={styles.row({ gap: "8px" })}>
        <Button
          onClick={onSave}
          isLoading={busy}
          disabled={isSaveDisabled}
          text={CUSTOMER_OWN_CONTACT_COPY.SAVE}
        />
        <Button
          disabled={busy}
          onClick={onCancel}
          variant={BUTTON_VARIANTS.NEUTRAL}
          text={CUSTOMER_OWN_CONTACT_COPY.CANCEL}
        />
      </Box>
    </Box>
  );
};

export default CustomerOwnContactEditor;
