import Dot from "../Dot/Dot";
import type { FC } from "react";
import { useStyles } from "./Tabs.style";
import { Box, ButtonBase } from "@mui/material";
import type { ITabItem } from "../../interfaces/tab-item.interface";
import { formatParenthesizedCount } from "../../utilities/text.utility";
import { TABS_VARIANTS, type TabsVariantType } from "../../constants/tabs.constant";

interface ITabsProps {
  activeId: string;
  items: ITabItem[];
  disabled?: boolean;
  isFullWidth?: boolean;
  variant?: TabsVariantType;
  onChange: (id: string) => void;
  formatCount?: (count: number) => string;
}

const Tabs: FC<ITabsProps> = ({
  items,
  disabled = false,
  activeId,
  onChange,
  isFullWidth = false,
  formatCount = formatParenthesizedCount,
  variant = TABS_VARIANTS.SEGMENTED,
}) => {
  const styles = useStyles();

  return (
    <Box role="tablist" sx={styles.container({ variant, isFullWidth })}>
      {items.map(item => {
        const countLabel = item.count != null ? formatCount(item.count) : null;
        const isActive = item.id === activeId;
        const tabStyles = styles.tab({ variant, isFullWidth, isActive });
        return (
          <ButtonBase
            role="tab"
            key={item.id}
            sx={tabStyles}
            disabled={disabled}
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
          >
            {item.dotColor && <Dot size={7} color={item.dotColor} />}
            {item.label}
            {countLabel != null && (
              <Box component="span" sx={styles.count}>
                {countLabel}
              </Box>
            )}
          </ButtonBase>
        );
      })}
    </Box>
  );
};

export default Tabs;
