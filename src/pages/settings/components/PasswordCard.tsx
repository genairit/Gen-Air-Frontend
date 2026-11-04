import {
  validatePassword,
  createPasswordConfirmationValidator,
} from "../../../utilities/validators";

import { useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { SETTINGS_COPY } from "../../../constants/settings.constant";
import InlineError from "../../../components/InlineError/InlineError";
import { clearSessionAction } from "../../../actions/session-reset.action";
import { useUpdatePasswordMutation } from "../../../hooks/mutations/user.mutation";
import { getPasswordChangeErrorMessage } from "../../../utilities/api-error.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

const PasswordCard = () => {
  const styles = usePageStyles();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const validateConfirmation = createPasswordConfirmationValidator(password);

  const isCurrentPasswordValid = validatePassword(currentPassword).isValid;
  const isPasswordValid = validatePassword(password).isValid;
  const isConfirmationValid = validateConfirmation(confirmation).isValid;
  const isUpdateDisabled = !isCurrentPasswordValid || !isPasswordValid || !isConfirmationValid;

  const passwordMutation = useUpdatePasswordMutation();

  const clearFields = () => {
    setCurrentPassword("");
    setPassword("");
    setConfirmation("");
  };

  const updateCurrentPassword = (value: string) => {
    passwordMutation.reset();
    setCurrentPassword(value);
  };

  const updatePassword = (value: string) => {
    passwordMutation.reset();
    setPassword(value);
  };

  const updateConfirmation = (value: string) => {
    passwordMutation.reset();
    setConfirmation(value);
  };

  const finishPasswordChange = () => {
    clearFields();
    clearSessionAction();
    navigate(ROUTE_PATHS.LOGIN, { replace: true, state: { passwordChanged: true } });
  };

  const handleUpdate = () =>
    passwordMutation.mutate({ currentPassword, password }, { onSuccess: finishPasswordChange });

  return (
    <Card gap="16px">
      <CardHeader
        icon={ICON_NAMES.CUSTOMER}
        title={SETTINGS_COPY.PASSWORD_TITLE}
        subtitle={SETTINGS_COPY.PASSWORD_SUBTITLE}
      />
      <Box sx={styles.grid({ minColumnWidth: 160, gap: "14px" })}>
        <TextField
          isLtr
          isRequired
          value={currentPassword}
          type={FIELD_TYPES.PASSWORD}
          autoComplete="current-password"
          onChange={updateCurrentPassword}
          title={SETTINGS_COPY.CURRENT_PASSWORD}
          placeholder={SETTINGS_COPY.CURRENT_PASSWORD_PLACEHOLDER}
        />
        <TextField
          isLtr
          isRequired
          value={password}
          onChange={updatePassword}
          type={FIELD_TYPES.PASSWORD}
          autoComplete="new-password"
          title={SETTINGS_COPY.NEW_PASSWORD}
          titleHint={SETTINGS_COPY.NEW_PASSWORD_HINT}
          placeholder={SETTINGS_COPY.NEW_PASSWORD_PLACEHOLDER}
        />
        <TextField
          isLtr
          isRequired
          value={confirmation}
          type={FIELD_TYPES.PASSWORD}
          autoComplete="new-password"
          onChange={updateConfirmation}
          validator={validateConfirmation}
          title={SETTINGS_COPY.CONFIRM_PASSWORD}
          placeholder={SETTINGS_COPY.CONFIRM_PASSWORD_PLACEHOLDER}
        />
      </Box>
      {passwordMutation.isError && (
        <InlineError message={getPasswordChangeErrorMessage(passwordMutation.error)} />
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
