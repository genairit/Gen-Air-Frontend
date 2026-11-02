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
  stackActionsOnMobile?: boolean;
}

const CardHeader: FC<ICardHeaderProps> = ({
  title,
  icon,
  badge,
  subtitle,
  action,
  stackActionsOnMobile = false,
}) => {
  const styles = useStyles();
  const headerAction = stackActionsOnMobile ? null : action;
  const separateAction = stackActionsOnMobile ? action : null;

  return (
    <Box sx={styles.container}>
      {icon && <IconTile name={icon} />}
      <Box sx={styles.content}>
        <Box sx={styles.headerLayout({ stackActionsOnMobile })}>
          <Box sx={styles.titles}>
            <SmartbaseCardHeader
              title={title}
              onRemove={null}
              subtitle={subtitle}
              action={headerAction}
              titleAccessory={badge && <Chip label={badge} />}
            />
          </Box>
          {separateAction && <Box sx={styles.action}>{separateAction}</Box>}
        </Box>
      </Box>
    </Box>
  );
};

export default CardHeader;
