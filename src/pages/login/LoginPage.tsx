import { useState } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./LoginPage.style";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import { useSession } from "../../store/session.store";
import { theme } from "../../constants/theme.constants";
import { Navigate, useNavigate } from "react-router-dom";
import CheckBox from "../../components/CheckBox/CheckBox";
import IconTile from "../../components/IconTile/IconTile";
import { ICON_NAMES } from "../../constants/icon.constant";
import { BRAND } from "../../constants/navigation.constant";
import TextField from "../../components/TextField/TextField";
import { ROUTE_PATHS } from "../../constants/routes.constant";
import { SURFACE_DEPTHS } from "../../constants/surface.constant";
import InlineError from "../../components/InlineError/InlineError";
import { ICON_TILE_SIZES } from "../../constants/icon-tile.constant";
import { useLoginMutation } from "../../hooks/mutations/user.mutation";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { canSubmitCredentials } from "../../utilities/credentials.utility";
import { LOGIN_COPY, SUPPORT_EMAIL } from "../../constants/login.constant";
import { BUTTON_SIZES } from "../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../components/TextField/constants/textfield.constants";

const LoginPage = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRemembered, setIsRemembered] = useState(true);
  const session = useSession();
  const loginMutation = useLoginMutation();
  const isSubmitDisabled = !canSubmitCredentials({ email, password });

  const handleLogin = () =>
    loginMutation.mutate(
      { email, password, isRemembered },
      { onSuccess: () => navigate(ROUTE_PATHS.BOARD, { replace: true }) },
    );

  if (session) {
    return <Navigate replace to={ROUTE_PATHS.BOARD} />;
  }

  return (
    <Box component="main" sx={styles.page}>
      <Box sx={styles.brand}>
        <IconTile
          name={ICON_NAMES.AIR}
          size={ICON_TILE_SIZES.XLARGE}
          depth={SURFACE_DEPTHS.RAISED}
          iconColor={theme.palette.orange}
        />
        <Box component="b" sx={styles.brandTitle}>
          {BRAND.TITLE}
        </Box>
        <Box component="span" sx={styles.eyebrow}>
          {BRAND.EYEBROW}
        </Box>
        <Box component="h1" sx={styles.title}>
          {LOGIN_COPY.TITLE}
        </Box>
        <Box component="span" sx={styles.subtitle}>
          {LOGIN_COPY.SUBTITLE}
        </Box>
      </Box>

      <Card gap="20px" padding="32px" sx={styles.card}>
        <TextField
          value={email}
          onChange={setEmail}
          type={FIELD_TYPES.EMAIL}
          startIcon={ICON_NAMES.EMAIL}
          title={LOGIN_COPY.EMAIL_LABEL}
          placeholder="name@gen-air.co.il"
        />
        <TextField
          value={password}
          onChange={setPassword}
          startIcon={ICON_NAMES.VIEW}
          type={FIELD_TYPES.PASSWORD}
          title={LOGIN_COPY.PASSWORD_LABEL}
          titleAction={
            <Box href={`mailto:${SUPPORT_EMAIL}`} component="a" sx={styles.link}>
              {LOGIN_COPY.FORGOT_PASSWORD}
            </Box>
          }
        />
        <CheckBox value={isRemembered} onChange={setIsRemembered} text={LOGIN_COPY.REMEMBER_ME} />
        {loginMutation.isError && <InlineError message={getApiErrorMessage(loginMutation.error)} />}
        <Button
          onClick={handleLogin}
          sx={styles.fullWidth}
          text={LOGIN_COPY.SUBMIT}
          size={BUTTON_SIZES.LARGE}
          disabled={isSubmitDisabled}
          isLoading={loginMutation.isPending}
        />
        <Box sx={styles.divider} />
        <Box component="span" sx={styles.smallCaption}>
          {LOGIN_COPY.SECURE_CONNECTION}
        </Box>
      </Card>

      <Box component="span" sx={styles.caption}>
        {LOGIN_COPY.SUPPORT_PROMPT}
        <Box component="a" sx={styles.link} href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
