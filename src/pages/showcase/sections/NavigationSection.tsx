import {
  SIDEBAR_ITEMS,
  MOBILE_NAV_ITEMS,
  SHOWCASE_PAGE_COUNT,
  SHOWCASE_TOP_BAR_USER,
  SHOWCASE_CURRENT_USER,
} from "../../../constants/showcase.constant";

import { useState } from "react";
import { Box } from "@mui/material";
import ShowcaseSection from "../ShowcaseSection";
import { useShowcaseStyles } from "../showcase.style";
import TopBar from "../../../components/TopBar/TopBar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { noop } from "../../../utilities/function.utility";
import BackLink from "../../../components/BackLink/BackLink";
import BrandLogo from "../../../components/BrandLogo/BrandLogo";
import Pagination from "../../../components/Pagination/Pagination";
import SidebarUserCard from "../../../components/Sidebar/SidebarUserCard";
import { BRAND_LOGO_WIDTHS } from "../../../constants/brand-logo.constant";
import MobileBottomNav from "../../../components/MobileBottomNav/MobileBottomNav";

const NavigationSection = () => {
  const styles = useShowcaseStyles();
  const [page, setPage] = useState(1);
  const [activeSidebarId, setActiveSidebarId] = useState(SIDEBAR_ITEMS[0].id);
  const [activeMobileId, setActiveMobileId] = useState(MOBILE_NAV_ITEMS[0].id);

  return (
    <ShowcaseSection position={5} title="ניווט">
      <Box sx={[styles.row({ gap: "32px" }), styles.topAligned]}>
        <Sidebar
          items={SIDEBAR_ITEMS}
          activeId={activeSidebarId}
          onSelect={setActiveSidebarId}
          sectionTitle="פלטפורמת תפעול"
          brand={<BrandLogo width={BRAND_LOGO_WIDTHS.SIDEBAR} />}
          footer={
            <SidebarUserCard onAction={noop} actionLabel="התנתק" user={SHOWCASE_CURRENT_USER} />
          }
        />

        <Box sx={[styles.stack({ gap: "32px" }), styles.flexItem({ basis: "1 1 320px" })]}>
          <Box sx={styles.stack({ gap: "12px" })}>
            <Box component="span" sx={styles.label}>
              כותרת עליונה
            </Box>
            <TopBar
              onUserMenuClick={noop}
              user={SHOWCASE_TOP_BAR_USER}
              title="ניהול פרויקטים ומשימות"
            />
          </Box>

          <Box sx={styles.stack({ gap: "12px" })}>
            <Box component="span" sx={styles.label}>
              ניווט תחתון — מובייל
            </Box>
            <MobileBottomNav
              items={MOBILE_NAV_ITEMS}
              activeId={activeMobileId}
              onSelect={setActiveMobileId}
            />
          </Box>

          <Box sx={styles.stack({ gap: "12px" })}>
            <Box component="span" sx={styles.label}>
              ניווט חזרה ועימוד
            </Box>
            <Box sx={styles.spacedRow}>
              <BackLink to="/" label="חזרה ללוח הבקרה" />
              <Pagination
                page={page}
                nextLabel="הבא"
                onChange={setPage}
                previousLabel="הקודם"
                pageCount={SHOWCASE_PAGE_COUNT}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </ShowcaseSection>
  );
};

export default NavigationSection;
