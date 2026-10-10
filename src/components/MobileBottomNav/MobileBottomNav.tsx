import type { FC } from "react";
import { useStyles } from "./MobileBottomNav.style";
import { mergeSx } from "../../utilities/sx.utility";
import MobileBottomNavItem from "./MobileBottomNavItem";
import { Box, type SxProps, type Theme } from "@mui/material";
import type { INavigationItem } from "../../interfaces/navigation-item.interface";

interface IMobileBottomNavProps {
  activeId: string;
  sx?: SxProps<Theme>;
  items: INavigationItem[];
  onSelect: (id: string) => void;
}

const MobileBottomNav: FC<IMobileBottomNavProps> = ({ sx, items, activeId, onSelect }) => {
  const styles = useStyles();

  return (
    <Box component="nav" sx={mergeSx(styles.bar({ itemCount: items.length }), sx ?? null)}>
      {items.map(item => (
        <MobileBottomNavItem
          item={item}
          key={item.id}
          isActive={item.id === activeId}
          onSelect={() => onSelect(item.id)}
        />
      ))}
    </Box>
  );
};

export default MobileBottomNav;
