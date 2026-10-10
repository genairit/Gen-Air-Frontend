import Chip from "../Chip/Chip";
import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import IconTile from "../IconTile/IconTile";
import { useStyles } from "./CardHeader.style";
import type { IconNameType } from "../../constants/icon.constant";

interface ICardHeaderProps {
  title: string;
  badge?: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: IconNameType;
}

const CardHeader: FC<ICardHeaderProps> = ({ title, icon, badge, subtitle, action }) => {
  const styles = useStyles();

  return (
    <Box sx={styles.container}>
      <Box sx={styles.lead}>
        {icon && <IconTile name={icon} />}
        <Box sx={styles.text}>
          <Box sx={styles.titleRow}>
            <Box component="b" sx={styles.title}>
              {title}
            </Box>
            {badge && <Chip label={badge} />}
          </Box>
          {subtitle && (
            <Box component="span" sx={styles.subtitle}>
              {subtitle}
            </Box>
          )}
        </Box>
      </Box>
      {action}
    </Box>
  );
};

export default CardHeader;
