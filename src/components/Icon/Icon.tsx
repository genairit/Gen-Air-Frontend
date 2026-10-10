import type { FC } from "react";
import { useStyles } from "./Icon.style";
import { theme } from "../../constants/theme.constants";
import type { IconNameType } from "../../constants/icon.constant";
import { ICON_COMPONENTS } from "./constants/icon-components.constant";

interface IIconProps {
  size?: number;
  color?: string;
  name: IconNameType;
}

const Icon: FC<IIconProps> = ({ name, size = 24, color = theme.palette.charcoal }) => {
  const styles = useStyles();
  const IconComponent = ICON_COMPONENTS[name];

  return <IconComponent aria-hidden sx={styles.icon({ size, color })} />;
};

export default Icon;
