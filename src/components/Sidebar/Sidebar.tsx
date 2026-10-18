import type { FC, ReactNode } from "react";
import { useStyles } from "./Sidebar.style";
import SidebarNavItem from "./SidebarNavItem";
import { mergeSx } from "../../utilities/sx.utility";
import { Box, type SxProps, type Theme } from "@mui/material";
import type { INavigationItem } from "../../interfaces/navigation-item.interface";

interface ISidebarProps {
  brand: ReactNode;
  activeId: string;
  footer: ReactNode;
  sx?: SxProps<Theme>;
  sectionTitle: string;
  items: INavigationItem[];
  onSelect: (id: string) => void;
}

const Sidebar: FC<ISidebarProps> = ({
  sx,
  brand,
  items,
  footer,
  activeId,
  onSelect,
  sectionTitle,
}) => {
  const styles = useStyles();

  return (
    <Box component="aside" sx={mergeSx(styles.sidebar, sx ?? null)}>
      <Box sx={styles.brand}>{brand}</Box>

      <Box component="nav" sx={styles.navigation}>
        <Box component="span" sx={styles.sectionTitle}>
          {sectionTitle}
        </Box>
        {items.map(item => (
          <SidebarNavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={item.id === activeId}
            onSelect={() => onSelect(item.id)}
          />
        ))}
      </Box>

      <Box sx={styles.spacer} />

      {footer}
    </Box>
  );
};

export default Sidebar;
