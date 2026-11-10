import {
  TAB_MODES,
  TABS_VARIANTS,
  type TabsModeType,
  TAB_NAVIGATION_KEYS,
  type TabsVariantType,
  type TabNavigationKeyType,
} from "../../constants/tabs.constant";

import Dot from "../Dot/Dot";
import { useStyles } from "./Tabs.style";
import { TAB_THUMB_STYLE } from "./Tabs.style";
import { Box, ButtonBase } from "@mui/material";
import type { ITabItem } from "../../interfaces/tab-item.interface";
import { useId, type FC, type Ref, type KeyboardEvent } from "react";
import { motion, LayoutGroup, useReducedMotion } from "framer-motion";
import { isTabNavigationKey } from "./utilities/tab-navigation.utility";

interface ITabsProps {
  activeId: string;
  items: ITabItem[];
  disabled?: boolean;
  ariaLabel?: string;
  mode?: TabsModeType;
  isFullWidth?: boolean;
  ref?: Ref<HTMLDivElement>;
  variant?: TabsVariantType;
  onChange: (id: string) => void;
  formatCount?: (count: number) => string;
}

const Tabs: FC<ITabsProps> = ({
  ref,
  items,
  disabled = false,
  ariaLabel,
  activeId,
  onChange,
  mode = TAB_MODES.FILTER,
  isFullWidth = false,
  formatCount = String,
  variant = TABS_VARIANTS.SEGMENTED,
}) => {
  const styles = useStyles();
  const layoutGroupId = useId();
  const reducedMotion = useReducedMotion();
  const isFilter = mode === TAB_MODES.FILTER;
  const activeIndex = items.findIndex(item => item.id === activeId);
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (disabled || items.length === 0) {
      return;
    }

    const nextIndexByKey: Record<TabNavigationKeyType, number> = {
      [TAB_NAVIGATION_KEYS.HOME]: 0,
      [TAB_NAVIGATION_KEYS.END]: items.length - 1,
      [TAB_NAVIGATION_KEYS.NEXT]: (index + 1) % items.length,
      [TAB_NAVIGATION_KEYS.PREVIOUS]: (index - 1 + items.length) % items.length,
    };
    const nextIndex = isTabNavigationKey(event.key) ? nextIndexByKey[event.key] : null;

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    onChange(items[nextIndex].id);
    const tabs =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[data-tab-option]");
    tabs?.[nextIndex]?.focus();
  };

  return (
    <LayoutGroup id={layoutGroupId}>
      <Box
        ref={ref}
        aria-label={ariaLabel}
        role={isFilter ? "group" : "tablist"}
        sx={styles.container({ variant, isFullWidth })}
      >
        {items.map((item, index) => {
          const countLabel =
            typeof item.count === "number" ? formatCount(item.count) : (item.count ?? null);
          const isActive = item.id === activeId;
          const tabStyles = styles.tab({ variant, isFullWidth });
          const isRovingTab = isActive || (activeIndex < 0 && index === 0);
          const tabIndex = isFilter || isRovingTab ? 0 : -1;
          const buttonSemantics = isFilter
            ? { "aria-pressed": isActive }
            : { role: "tab" as const, "aria-selected": isActive };
          return (
            <ButtonBase
              type="button"
              key={item.id}
              sx={tabStyles}
              component="button"
              data-tab-option=""
              disabled={disabled}
              tabIndex={tabIndex}
              onClick={() => onChange(item.id)}
              onKeyDown={event => handleTabKeyDown(event, index)}
              {...buttonSemantics}
            >
              {isActive && (
                <motion.span
                  aria-hidden
                  initial={false}
                  layoutId="selected-tab"
                  style={TAB_THUMB_STYLE}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 38 }
                  }
                />
              )}
              <Box component="span" sx={styles.tabContent}>
                {item.dotColor && <Dot size={7} color={item.dotColor} />}
                {item.label}
                {countLabel != null && (
                  <Box component="span" sx={styles.count}>
                    {countLabel}
                  </Box>
                )}
              </Box>
            </ButtonBase>
          );
        })}
      </Box>
    </LayoutGroup>
  );
};

export default Tabs;
