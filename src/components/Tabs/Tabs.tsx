import type { FC } from "react";
import { useStyles } from "./Tabs.style";
import { Box, ButtonBase } from "@mui/material";
import type { ITabItem } from "../../interfaces/tab-item.interface";
import { TABS_VARIANTS, type TabsVariantType } from "../../constants/tabs.constant";

interface ITabsProps {
  activeId: string;
  items: ITabItem[];
  disabled?: boolean;
  isFullWidth?: boolean;
  variant?: TabsVariantType;
  onChange: (id: string) => void;
}

const Tabs: FC<ITabsProps> = ({
  items,
  disabled = false,
  activeId,
  onChange,
  isFullWidth = false,
  variant = TABS_VARIANTS.SEGMENTED,
}) => {
  const styles = useStyles();

  return (
    <Box role="tablist" sx={styles.container({ variant, isFullWidth })}>
      {items.map(item => (
        <ButtonBase
          role="tab"
          key={item.id}
          disabled={disabled}
          onClick={() => onChange(item.id)}
          aria-selected={item.id === activeId}
          sx={styles.tab({ variant, isFullWidth, isActive: item.id === activeId })}
        >
          {item.label}
          {item.count != null && <Box component="span" sx={styles.count}>{`(${item.count})`}</Box>}
        </ButtonBase>
      ))}
    </Box>
  );
};

export default Tabs;
