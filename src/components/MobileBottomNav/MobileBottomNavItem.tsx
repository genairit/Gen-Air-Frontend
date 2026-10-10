import Dot from "../Dot/Dot";
import type { FC } from "react";
import Icon from "../Icon/Icon";
import { ButtonBase } from "@mui/material";
import type { INavigationItem } from "../../interfaces/navigation-item.interface";
import { useStyles, getNavigationDotColor, getNavigationIconColor } from "./MobileBottomNav.style";

interface IMobileBottomNavItemProps {
  isActive: boolean;
  onSelect: () => void;
  item: INavigationItem;
}

const MobileBottomNavItem: FC<IMobileBottomNavItemProps> = ({ item, isActive, onSelect }) => {
  const styles = useStyles();

  return (
    <ButtonBase onClick={onSelect} sx={styles.item({ isActive })}>
      {item.icon ? (
        <Icon size={26} name={item.icon} color={getNavigationIconColor(isActive)} />
      ) : (
        <Dot size={6} color={getNavigationDotColor(isActive)} />
      )}
      {item.label}
    </ButtonBase>
  );
};

export default MobileBottomNavItem;
