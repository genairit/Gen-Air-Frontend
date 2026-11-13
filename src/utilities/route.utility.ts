import {
  BACK_LINK_BY_ROUTE,
  PAGE_TITLE_BY_ROUTE,
  ACTIVE_NAVIGATION_BY_ROUTE,
} from "../constants/navigation.constant";

import { generatePath, matchPath } from "react-router-dom";
import type { TaskType } from "../constants/task-type.constant";
import { ROUTE_PATHS, ROUTE_PARAMS } from "../constants/routes.constant";
import type { IBackLinkTarget } from "../interfaces/navigation-item.interface";
import { NEW_TASK_PROJECT_PARAM, NEW_TASK_TYPE_PARAM } from "../constants/task.constant";

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

export const getBackLinkTarget = (pathname: string): IBackLinkTarget | null => {
  const route = findMatchingRoute(pathname, Object.keys(BACK_LINK_BY_ROUTE));
  const match = route ? matchPath(route, pathname) : null;

  if (!route || !match) {
    return null;
  }

  const { label, buildPath } = BACK_LINK_BY_ROUTE[route];

  return { label, to: buildPath(match.params) };
};

export const getProjectFormCancelPath = (projectId: string | null) => {
  if (!projectId) {
    return ROUTE_PATHS.BOARD;
  }

  return buildProjectPath(projectId);
};

export const buildTaskPath = (taskId: string) => generatePath(ROUTE_PATHS.TASK, { taskId });

export const buildNewTaskPath = (projectId: string | null, taskType?: TaskType) => {
  if (!projectId) {
    return ROUTE_PATHS.NEW_TASK;
  }

  return `${ROUTE_PATHS.NEW_TASK}?${new URLSearchParams({
    [NEW_TASK_PROJECT_PARAM]: projectId,
    ...(taskType && { [NEW_TASK_TYPE_PARAM]: taskType }),
  })}`;
};

export const buildQuotationPath = (quotationId: string): string =>
  generatePath(ROUTE_PATHS.QUOTATION, { [ROUTE_PARAMS.QUOTATION_ID]: quotationId });
