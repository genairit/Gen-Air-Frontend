import Dot from "../Dot/Dot";
import type { FC } from "react";
import Icon from "../Icon/Icon";
import { Box, ButtonBase } from "@mui/material";
import { useStyles } from "./SidebarNavItem.style";
import { theme } from "../../constants/theme.constants";
import { useStyles as useSidebarStyles } from "./Sidebar.style";
import type { IconNameType } from "../../constants/icon.constant";

interface ISidebarNavItemProps {
  label: string;
  isActive: boolean;
  icon?: IconNameType;
  onSelect: () => void;
}

const SidebarNavItem: FC<ISidebarNavItemProps> = ({ label, icon, isActive, onSelect }) => {
  const styles = useStyles();
  const sidebarStyles = useSidebarStyles();
  const dotColor = isActive ? theme.palette.orange : "transparent";

  return (
    <ButtonBase
      onClick={onSelect}
      aria-current={isActive ? "page" : false}
      sx={[sidebarStyles.pill, styles.item({ isActive })]}
    >
      {icon && (
        <Box sx={styles.iconCircle({ isActive })}>
          <Icon name={icon} />
        </Box>
      )}
      <Box component="span" sx={styles.label}>
        {label}
      </Box>
      <Dot size={8} color={dotColor} />
    </ButtonBase>
  );
};

export default SidebarNavItem;
