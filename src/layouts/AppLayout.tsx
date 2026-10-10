import {
  getPageTitle,
  isProjectViewRoute,
  getActiveNavigationId,
} from "../utilities/route.utility";

import {
  BRAND,
  NAVIGATION_LABELS,
  APP_NAVIGATION_ITEMS,
  MOBILE_NAVIGATION_ITEMS,
} from "../constants/navigation.constant";

import { useStyles } from "./AppLayout.style";
import TopBar from "../components/TopBar/TopBar";
import { Box, useMediaQuery } from "@mui/material";
import Sidebar from "../components/Sidebar/Sidebar";
import { noop } from "../utilities/function.utility";
import BackLink from "../components/BackLink/BackLink";
import { ICON_NAMES } from "../constants/icon.constant";
import { useSessionUser } from "../store/session.store";
import BrandLogo from "../components/BrandLogo/BrandLogo";
import { ROUTE_PATHS } from "../constants/routes.constant";
import { toPerson } from "../utilities/mappers/user.mapper";
import SidebarAction from "../components/Sidebar/SidebarAction";
import { MOBILE_LAYOUT_QUERY } from "../constants/layout.constant";
import { BRAND_LOGO_WIDTHS } from "../constants/brand-logo.constant";
import { clearSessionAction } from "../actions/session-reset.action";
import MobileBottomNav from "../components/MobileBottomNav/MobileBottomNav";
import { Outlet, useLocation, useNavigate, ScrollRestoration } from "react-router-dom";

const AppLayout = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMobile = useMediaQuery(MOBILE_LAYOUT_QUERY);
  const sessionUser = useSessionUser();
  const activeNavigationId = getActiveNavigationId(pathname);

  const logout = () => {
    clearSessionAction();
    navigate(ROUTE_PATHS.LOGIN, { replace: true });
  };

  const handleNavigate = (path: string) => {
    if (path === ROUTE_PATHS.LOGIN) {
      logout();
      return;
    }

    navigate(path);
  };

  if (!sessionUser) {
    return null;
  }

  const topBarLeading = isProjectViewRoute(pathname) ? (
    <BackLink to={ROUTE_PATHS.BOARD} label={NAVIGATION_LABELS.BACK_TO_BOARD} />
  ) : null;

  return (
    <Box sx={styles.shell}>
      <ScrollRestoration />
      {!isMobile && (
        <Box sx={styles.sidebarSlot}>
          <Sidebar
            sx={styles.sidebar}
            onSelect={handleNavigate}
            items={APP_NAVIGATION_ITEMS}
            activeId={activeNavigationId}
            sectionTitle={BRAND.SECTION_TITLE}
            brand={<BrandLogo width={BRAND_LOGO_WIDTHS.SIDEBAR} />}
            footer={
              <SidebarAction
                label={NAVIGATION_LABELS.LOGOUT}
                icon={ICON_NAMES.LOGOUT}
                onClick={logout}
              />
            }
          />
        </Box>
      )}

      <Box component="main" sx={styles.main({ isMobile })}>
        <TopBar
          onUserMenuClick={noop}
          leading={topBarLeading}
          user={toPerson(sessionUser)}
          title={getPageTitle(pathname)}
        />
        <Outlet />
      </Box>

      {isMobile && (
        <MobileBottomNav
          onSelect={handleNavigate}
          sx={styles.mobileNavigation}
          activeId={activeNavigationId}
          items={MOBILE_NAVIGATION_ITEMS}
        />
      )}
    </Box>
  );
};

export default AppLayout;
