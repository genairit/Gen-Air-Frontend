import {
  NAVIGATION_LABELS,
  BACK_LINK_BY_ROUTE,
  PAGE_TITLE_BY_ROUTE,
  ACTIVE_NAVIGATION_BY_ROUTE,
} from "../constants/navigation.constant";

import { ROUTE_PATHS, ROUTE_PARAMS } from "../constants/routes.constant";
import type { IBackLinkTarget } from "../interfaces/navigation-item.interface";
import { generatePath, matchPath, parsePath, type Location } from "react-router-dom";
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

export const buildProjectQuotationsPath = (projectId: string) =>
  `${buildProjectPath(projectId)}?${PROJECT_TAB_PARAM}=${PROJECT_TABS.quotations.id}`;

export const projectQuotationOrigin = (location: Location) => ({
  quotationReturnTo: location.pathname + location.search,
  ...(typeof location.state?.buildingSearch === "string"
    ? { buildingSearch: location.state.buildingSearch }
    : {}),
});

export const getQuotationReturnPath = (returnTo: unknown, projectId: string | null): string => {
  const fallback = projectId ? buildProjectQuotationsPath(projectId) : ROUTE_PATHS.BOARD;
  if (typeof returnTo !== "string") {
    return fallback;
  }
  const { pathname = "", search } = parsePath(returnTo);
  const isProject =
    matchPath(ROUTE_PATHS.PROJECT, pathname) || matchPath(ROUTE_PATHS.APARTMENT, pathname);
  if (!isProject) {
    return fallback;
  }
  const params = new URLSearchParams(search);
  params.set(PROJECT_TAB_PARAM, PROJECT_TABS.quotations.id);
  return `${pathname}?${params}`;
};

export const getBackLinkTarget = (
  pathname: string,
  options: {
    buildingSearch?: unknown;
    quotationReturnTo?: unknown;
    quotationProjectId?: string | null;
  } = {},
): IBackLinkTarget | null => {
  const createMatch = matchPath(ROUTE_PATHS.PROJECT_QUOTATION_CREATE, pathname);
  if (createMatch || matchPath(ROUTE_PATHS.QUOTATION, pathname)) {
    const projectId = createMatch?.params.projectId ?? options.quotationProjectId ?? null;
    const to = getQuotationReturnPath(options.quotationReturnTo, projectId);
    const label =
      to === ROUTE_PATHS.BOARD
        ? NAVIGATION_LABELS.BACK_TO_BOARD
        : NAVIGATION_LABELS.BACK_TO_QUOTATIONS;
    return { label, to };
  }
  const route = findMatchingRoute(pathname, Object.keys(BACK_LINK_BY_ROUTE));
  const match = route ? matchPath(route, pathname) : null;

  if (!route || !match) {
    return null;
  }

  const { label, buildPath } = BACK_LINK_BY_ROUTE[route];

  if (route === ROUTE_PATHS.APARTMENT || route === ROUTE_PATHS.NEW_APARTMENT) {
    return {
      label,
      to: getApartmentBuildingPath(match.params.projectId ?? "", options.buildingSearch),
    };
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
