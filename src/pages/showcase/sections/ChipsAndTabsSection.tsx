import {
  PROJECT_VIEW_TABS,
  SHOWCASE_TYPE_TAGS,
  EMPLOYEE_FILTER_TABS,
  SHOWCASE_STATUS_CHIPS,
} from "../../../constants/showcase.constant";

import { useState } from "react";
import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import Tabs from "../../../components/Tabs/Tabs";
import ShowcaseSection from "../ShowcaseSection";
import { useShowcaseStyles } from "../showcase.style";
import { TABS_VARIANTS } from "../../../constants/tabs.constant";

const ChipsAndTabsSection = () => {
  const styles = useShowcaseStyles();
  const [activeViewTab, setActiveViewTab] = useState(PROJECT_VIEW_TABS[0].id);
  const [activeFilterTab, setActiveFilterTab] = useState(EMPLOYEE_FILTER_TABS[0].id);

  return (
    <ShowcaseSection position={4} title="תגיות, סטטוסים וטאבים">
      <Box sx={styles.grid({ minColumnWidth: 340 })}>
        <Card gap="20px" padding="28px">
          <Box component="span" sx={styles.label}>
            סטטוס
          </Box>
          <Box sx={styles.row({ gap: "12px" })}>
            {SHOWCASE_STATUS_CHIPS.map(chip => (
              <Chip key={chip.label} {...chip} />
            ))}
          </Box>
          <Box component="span" sx={styles.label}>
            סוג ותפקיד
          </Box>
          <Box sx={styles.row({ gap: "10px" })}>
            {SHOWCASE_TYPE_TAGS.map(tag => (
              <Chip key={tag.label} {...tag} />
            ))}
          </Box>
        </Card>

        <Card gap="20px" padding="28px">
          <Box component="span" sx={styles.label}>
            טאבים — מסנן
          </Box>
          <Tabs
            activeId={activeFilterTab}
            items={EMPLOYEE_FILTER_TABS}
            onChange={setActiveFilterTab}
          />
          <Box component="span" sx={styles.label}>
            טאבים — תצוגת פרויקט
          </Box>
          <Tabs
            activeId={activeViewTab}
            items={PROJECT_VIEW_TABS}
            onChange={setActiveViewTab}
            variant={TABS_VARIANTS.PILLS}
          />
        </Card>
      </Box>
    </ShowcaseSection>
  );
};

export default ChipsAndTabsSection;
