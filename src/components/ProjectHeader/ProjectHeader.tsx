import Card from "../Card/Card";
import Chip from "../Chip/Chip";
import Icon from "../Icon/Icon";
import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import IconTile from "../IconTile/IconTile";
import { useStyles } from "./ProjectHeader.style";
import { theme } from "../../constants/theme.constants";
import { SURFACE_DEPTHS } from "../../constants/surface.constant";
import { ICON_TILE_SIZES } from "../../constants/icon-tile.constant";
import { CHIP_SIZES, CHIP_VARIANTS } from "../../constants/chip.constant";
import { ICON_NAMES, type IconNameType } from "../../constants/icon.constant";

interface IProjectHeaderProps {
  title: string;
  stage: string;
  projectId: string;
  actions: ReactNode;
  syncCaption: string;
  icon?: IconNameType;
  stageDotColor?: string;
}

const ProjectHeader: FC<IProjectHeaderProps> = ({
  icon,
  title,
  stage,
  projectId,
  syncCaption,
  actions,
  stageDotColor = theme.palette.statusBlue,
}) => {
  const styles = useStyles();

  return (
    <Card gap="20px" padding="24px" sx={styles.card}>
      <Box sx={styles.identity}>
        {icon && <IconTile name={icon} size={ICON_TILE_SIZES.LARGE} depth={SURFACE_DEPTHS.INSET} />}
        <Box sx={styles.details}>
          <Box sx={styles.titleRow}>
            <Box component="h3" sx={styles.title}>
              {title}
            </Box>
            <Chip isMonospace label={projectId} variant={CHIP_VARIANTS.INSET} />
            <Chip label={stage} size={CHIP_SIZES.MEDIUM} dotColor={stageDotColor} />
          </Box>
          <Box component="span" sx={styles.caption}>
            <Icon size={20} name={ICON_NAMES.ERP} />
            {syncCaption}
          </Box>
        </Box>
      </Box>
      <Box sx={styles.actions}>{actions}</Box>
    </Card>
  );
};

export default ProjectHeader;
