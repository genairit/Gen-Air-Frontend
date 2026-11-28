import {
  BACK_LINK_BY_ROUTE,
  PAGE_TITLE_BY_ROUTE,
  ACTIVE_NAVIGATION_BY_ROUTE,
} from "../constants/navigation.constant";

import { generatePath, matchPath } from "react-router-dom";
import { ROUTE_PATHS, ROUTE_PARAMS } from "../constants/routes.constant";
import type { IBackLinkTarget } from "../interfaces/navigation-item.interface";
import { PROJECT_TABS, PROJECT_TAB_PARAM } from "../constants/project-workspace.constant";

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

export const buildApartmentPath = (buildingId: string, apartmentId: string) =>
  generatePath(ROUTE_PATHS.APARTMENT, { projectId: buildingId, apartmentId });

export const buildNewApartmentPath = (buildingId: string) =>
  generatePath(ROUTE_PATHS.NEW_APARTMENT, { projectId: buildingId });

export const buildCustomerPath = (customerId: string) =>
  generatePath(ROUTE_PATHS.CUSTOMER, { customerId });

export const getApartmentBuildingPath = (buildingId: string, buildingSearch?: unknown) => {
  const search = new URLSearchParams(typeof buildingSearch === "string" ? buildingSearch : "");
  search.set(PROJECT_TAB_PARAM, PROJECT_TABS.apartments.id);
  return `${buildProjectPath(buildingId)}?${search}`;
};

export const getBackLinkTarget = (
  pathname: string,
  buildingSearch?: unknown,
): IBackLinkTarget | null => {
  const route = findMatchingRoute(pathname, Object.keys(BACK_LINK_BY_ROUTE));
  const match = route ? matchPath(route, pathname) : null;

  if (!route || !match) {
    return null;
  }

  const { label, buildPath } = BACK_LINK_BY_ROUTE[route];

  if (route === ROUTE_PATHS.APARTMENT || route === ROUTE_PATHS.NEW_APARTMENT) {
    return { label, to: getApartmentBuildingPath(match.params.projectId ?? "", buildingSearch) };
  }
  return { label, to: buildPath(match.params) };
};

export const getProjectFormCancelPath = (projectId: string | null) => {
  if (!projectId) {
    return ROUTE_PATHS.BOARD;
  }

  return buildProjectPath(projectId);
};

export const buildTaskPath = (taskId: string) => generatePath(ROUTE_PATHS.TASK, { taskId });

export const buildQuotationPath = (quotationId: string): string =>
  generatePath(ROUTE_PATHS.QUOTATION, { [ROUTE_PARAMS.QUOTATION_ID]: quotationId });
