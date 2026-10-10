import {
  validatePassword,
  createPasswordConfirmationValidator,
} from "../../../utilities/validators";

import { useState } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { SETTINGS_COPY } from "../../../constants/settings.constant";
import InlineError from "../../../components/InlineError/InlineError";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useUpdatePasswordMutation } from "../../../hooks/mutations/user.mutation";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

const PasswordCard = () => {
  const styles = usePageStyles();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const validateConfirmation = createPasswordConfirmationValidator(password);

  const isPasswordValid = validatePassword(password).isValid;
  const isConfirmationValid = validateConfirmation(confirmation).isValid;
  const isUpdateDisabled = !isPasswordValid || !isConfirmationValid;

  const passwordMutation = useUpdatePasswordMutation();

  const clearFields = () => {
    setPassword("");
    setConfirmation("");
  };

  const handleUpdate = () => passwordMutation.mutate(password, { onSuccess: clearFields });

  return (
    <Card gap="16px">
      <CardHeader
        icon={ICON_NAMES.CUSTOMER}
        title={SETTINGS_COPY.PASSWORD_TITLE}
        subtitle={SETTINGS_COPY.PASSWORD_SUBTITLE}
      />
      <Box sx={styles.grid({ minColumnWidth: 160, gap: "14px" })}>
        <TextField
          value={password}
          onChange={setPassword}
          type={FIELD_TYPES.PASSWORD}
          title={SETTINGS_COPY.NEW_PASSWORD}
          placeholder={SETTINGS_COPY.NEW_PASSWORD_PLACEHOLDER}
        />
        <TextField
          value={confirmation}
          onChange={setConfirmation}
          type={FIELD_TYPES.PASSWORD}
          validator={validateConfirmation}
          title={SETTINGS_COPY.CONFIRM_PASSWORD}
          placeholder={SETTINGS_COPY.CONFIRM_PASSWORD_PLACEHOLDER}
        />
      </Box>
      {passwordMutation.isError && (
        <InlineError message={getApiErrorMessage(passwordMutation.error)} />
      )}
      {passwordMutation.isSuccess && (
        <Box component="span" sx={styles.caption}>
          {SETTINGS_COPY.PASSWORD_UPDATED}
        </Box>
      )}
      <Button
        sx={styles.fullWidth}
        onClick={handleUpdate}
        disabled={isUpdateDisabled}
        variant={BUTTON_VARIANTS.SECONDARY}
        text={SETTINGS_COPY.UPDATE_PASSWORD}
        isLoading={passwordMutation.isPending}
      />
    </Card>
  );
};

export default PasswordCard;
