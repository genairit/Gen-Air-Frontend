import type { FC, ReactNode } from "react";
import { useStyles } from "./Sidebar.style";
import SidebarNavItem from "./SidebarNavItem";
import { mergeSx } from "../../utilities/sx.utility";
import { Box, type SxProps, type Theme } from "@mui/material";
import type { INavigationItem } from "../../interfaces/navigation-item.interface";

interface ISidebarProps {
  logo?: ReactNode;
  activeId: string;
  footer: ReactNode;
  brandTitle: string;
  sx?: SxProps<Theme>;
  sectionTitle: string;
  brandSubtitle: string;
  items: INavigationItem[];
  onSelect: (id: string) => void;
}

const Sidebar: FC<ISidebarProps> = ({
  sx,
  logo,
  items,
  footer,
  activeId,
  onSelect,
  brandTitle,
  sectionTitle,
  brandSubtitle,
}) => {
  const styles = useStyles();

  return (
    <Box component="aside" sx={mergeSx(styles.sidebar, sx ?? null)}>
      <Box sx={styles.brand}>
        {logo && <Box sx={styles.logo}>{logo}</Box>}
        <Box sx={styles.brandText}>
          <Box component="b" sx={styles.brandTitle}>
            {brandTitle}
          </Box>
          <Box component="span" sx={styles.brandSubtitle}>
            {brandSubtitle}
          </Box>
        </Box>
      </Box>

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
