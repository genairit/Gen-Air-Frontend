import Chip from "../Chip/Chip";
import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import IconTile from "../IconTile/IconTile";
import { useStyles } from "./CardHeader.style";
import type { IconNameType } from "../../constants/icon.constant";
import SmartbaseCardHeader from "../../vendor/smartbase/components/Card/components/CardHeader";

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
      {icon && <IconTile name={icon} />}
      <Box sx={styles.content}>
        <SmartbaseCardHeader
          title={title}
          action={action}
          onRemove={null}
          subtitle={subtitle}
          titleAccessory={badge && <Chip label={badge} />}
        />
      </Box>
    </Box>
  );
};

export default CardHeader;
