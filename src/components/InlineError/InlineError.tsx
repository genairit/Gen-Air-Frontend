import type { FC } from "react";
import Icon from "../Icon/Icon";
import { Box } from "@mui/material";
import { useStyles } from "./InlineError.style";
import { theme } from "../../constants/theme.constants";
import { ICON_NAMES } from "../../constants/icon.constant";

interface IInlineErrorProps {
  message: string;
}

const InlineError: FC<IInlineErrorProps> = ({ message }) => {
  const styles = useStyles();

  return (
    <Box role="alert" sx={styles.message}>
      <Icon size={20} name={ICON_NAMES.INFO} color={theme.palette.danger} />
      {message}
    </Box>
  );
};

export default InlineError;
