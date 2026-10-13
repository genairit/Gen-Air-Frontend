import {
  BACK_LINK_BY_ROUTE,
  PAGE_TITLE_BY_ROUTE,
  ACTIVE_NAVIGATION_BY_ROUTE,
} from "../constants/navigation.constant";

import { generatePath, matchPath } from "react-router-dom";
import { ROUTE_PATHS } from "../constants/routes.constant";

export const buildProjectPath = (projectId: string) =>
  generatePath(ROUTE_PATHS.PROJECT, { projectId });

export const buildEditProjectPath = (projectId: string) =>
  generatePath(ROUTE_PATHS.EDIT_PROJECT, { projectId });

const findMatchingRoute = (pathname: string, routePatterns: string[]) =>
  routePatterns.find(pattern => matchPath(pattern, pathname)) ?? null;

export const getPageTitle = (pathname: string) => {
  const route = findMatchingRoute(pathname, Object.keys(PAGE_TITLE_BY_ROUTE));

  if (!route) {
    return "";
  }

  return PAGE_TITLE_BY_ROUTE[route];
};

export const getActiveNavigationId = (pathname: string) => {
  const route = findMatchingRoute(pathname, Object.keys(ACTIVE_NAVIGATION_BY_ROUTE));

  if (!route) {
    return ROUTE_PATHS.BOARD;
  }

  return ACTIVE_NAVIGATION_BY_ROUTE[route];
};

export const buildCustomerPath = (customerId: string) =>
  generatePath(ROUTE_PATHS.CUSTOMER, { customerId });

export const getBackLinkTarget = (pathname: string) => {
  const route = findMatchingRoute(pathname, Object.keys(BACK_LINK_BY_ROUTE));

  if (!route) {
    return null;
  }

  return BACK_LINK_BY_ROUTE[route];
};

export const getProjectFormCancelPath = (projectId: string | null) => {
  if (!projectId) {
    return ROUTE_PATHS.BOARD;
  }

  return buildProjectPath(projectId);
};
