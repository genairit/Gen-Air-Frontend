import Card from "../Card/Card";
import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import IconTile from "../IconTile/IconTile";
import { useStyles } from "./EmptyState.style";
import type { IconNameType } from "../../constants/icon.constant";
import { ICON_TILE_SIZES } from "../../constants/icon-tile.constant";

interface IEmptyStateProps {
  title: string;
  action?: ReactNode;
  icon: IconNameType;
  description: string;
}

const EmptyState: FC<IEmptyStateProps> = ({ icon, title, description, action }) => {
  const styles = useStyles();

  return (
    <Card gap="16px" sx={styles.card} padding="40px 24px">
      <IconTile name={icon} size={ICON_TILE_SIZES.LARGE} />
      <Box component="b" sx={styles.title}>
        {title}
      </Box>
      <Box component="span" sx={styles.description}>
        {description}
      </Box>
      {action}
    </Card>
  );
};

export default EmptyState;
