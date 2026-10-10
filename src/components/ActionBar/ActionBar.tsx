import Card from "../Card/Card";
import Icon from "../Icon/Icon";
import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "./ActionBar.style";
import { SURFACE_RADII } from "../../constants/surface.constant";
import type { IconNameType } from "../../constants/icon.constant";

interface IActionBarProps {
  caption: string;
  children: ReactNode;
  captionIcon?: IconNameType;
}

const ActionBar: FC<IActionBarProps> = ({ caption, captionIcon, children }) => {
  const styles = useStyles();

  return (
    <Card gap="14px" padding="12px" sx={styles.bar} radius={SURFACE_RADII.PILL}>
      <Box component="span" sx={styles.caption}>
        {captionIcon && <Icon size={22} name={captionIcon} />}
        {caption}
      </Box>
      <Box sx={styles.actions}>{children}</Box>
    </Card>
  );
};

export default ActionBar;
