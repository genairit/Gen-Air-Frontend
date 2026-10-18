import type { FC } from "react";
import Icon from "../Icon/Icon";
import { Box } from "@mui/material";
import { useStyles } from "./ButtonContent.style";
import { theme } from "../../constants/theme.constants";
import type { IconNameType } from "../../constants/icon.constant";

interface IButtonContentProps {
  text?: string;
  iconColor: string;
  icon?: IconNameType;
  hasIconBadge: boolean;
}

const ButtonContent: FC<IButtonContentProps> = ({ text, icon, iconColor, hasIconBadge }) => {
  const styles = useStyles();

  if (!icon) {
    return text;
  }

  if (hasIconBadge) {
    return (
      <Box component="span" sx={styles.content}>
        <Box component="span" sx={styles.iconBadge}>
          <Icon name={icon} color={theme.palette.primary} />
        </Box>
        {text}
      </Box>
    );
  }

  return (
    <Box component="span" sx={styles.content}>
      <Icon name={icon} color={iconColor} />
      {text}
    </Box>
  );
};

export default ButtonContent;
