import {
  BRAND,
  NAVIGATION_LABELS,
  APP_NAVIGATION_ITEMS,
  MOBILE_NAVIGATION_ITEMS,
} from "../constants/navigation.constant";

import { useEffect } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./AppLayout.style";
import TopBar from "../components/TopBar/TopBar";
import Sidebar from "../components/Sidebar/Sidebar";
import BackLink from "../components/BackLink/BackLink";
import { ICON_NAMES } from "../constants/icon.constant";
import { useSessionUser } from "../store/session.store";
import BrandLogo from "../components/BrandLogo/BrandLogo";
import { ROUTE_PATHS } from "../constants/routes.constant";
import { toPerson } from "../utilities/mappers/user.mapper";
import SidebarAction from "../components/Sidebar/SidebarAction";
import { BRAND_LOGO_WIDTHS } from "../constants/brand-logo.constant";
import { clearSessionAction } from "../actions/session-reset.action";
import { switchActiveRoleAction } from "../actions/role-switch.action";
import MobileBottomNav from "../components/MobileBottomNav/MobileBottomNav";
import { refreshSessionUserAction } from "../actions/session-refresh.action";
import { SessionBroadcastManager } from "../managers/session-broadcast.manager";
import { Outlet, useLocation, useNavigate, ScrollRestoration } from "react-router-dom";
import { filterNavigationByPermissions } from "../utilities/navigation-permission.utility";
import { getPageTitle, getBackLinkTarget, getActiveNavigationId } from "../utilities/route.utility";

const AppLayout = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const sessionUser = useSessionUser();
  useEffect(() => SessionBroadcastManager.subscribeToUserChanges(refreshSessionUserAction), []);
  const navigationItems = filterNavigationByPermissions(APP_NAVIGATION_ITEMS, sessionUser);
  const mobileItems = filterNavigationByPermissions(MOBILE_NAVIGATION_ITEMS, sessionUser);
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

  const backLinkTarget = getBackLinkTarget(pathname);
  const topBarLeading = backLinkTarget && (
    <BackLink to={backLinkTarget.to} label={backLinkTarget.label} />
  );

  return (
    <Box sx={styles.shell}>
      <ScrollRestoration />
      <Box sx={styles.sidebarSlot}>
        <Sidebar
          sx={styles.sidebar}
          items={navigationItems}
          onSelect={handleNavigate}
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

      <Box component="main" sx={styles.main}>
        <TopBar
          leading={topBarLeading}
          user={toPerson(sessionUser)}
          activeRole={sessionUser.role}
          title={getPageTitle(pathname)}
          onRoleChange={switchActiveRoleAction}
          assignedRoles={sessionUser.assignedRoles}
        />
        <Outlet />
      </Box>

      <MobileBottomNav
        items={mobileItems}
        onSelect={handleNavigate}
        sx={styles.mobileNavigation}
        activeId={activeNavigationId}
      />
    </Box>
  );
};

export default AppLayout;
