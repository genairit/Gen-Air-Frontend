import {
  CUSTOMER_PROJECT_COPY,
  CUSTOMER_PROJECT_KINDS,
  type CustomerProjectKindType,
} from "../constants/customer-project.constant";

import type {
  ICustomerProjectItem,
  ICustomerProjectPage,
} from "../interfaces/customer-project.interface";

import { buildProjectPath, buildApartmentPath } from "./route.utility";

export const getCustomerProjectPath = (project: ICustomerProjectItem): string => {
  if (project.kind === CUSTOMER_PROJECT_KINDS.APARTMENT && project.parentProjectId) {
    return buildApartmentPath(project.parentProjectId, project.id);
  }

  return buildProjectPath(project.id);
};

const PROJECT_TYPE_LABELS: Record<
  CustomerProjectKindType,
  (project: ICustomerProjectItem) => string
> = {
  [CUSTOMER_PROJECT_KINDS.BUILDING]: () => CUSTOMER_PROJECT_COPY.BUILDING,
  [CUSTOMER_PROJECT_KINDS.APARTMENT]: () => CUSTOMER_PROJECT_COPY.APARTMENT,
  [CUSTOMER_PROJECT_KINDS.PROJECT]: project => project.projectType?.name ?? "",
};

export const getCustomerProjectType = (project: ICustomerProjectItem): string =>
  PROJECT_TYPE_LABELS[project.kind](project);

export const getCustomerProjectContext = (project: ICustomerProjectItem): string => {
  if (!project.building) {
    return "";
  }

  const floor =
    project.customerFloor === null ? "" : `${CUSTOMER_PROJECT_COPY.FLOOR} ${project.customerFloor}`;
  return [project.building.name, project.building.code, floor].filter(Boolean).join(" · ");
};

export const getCustomerProjectId = (project: ICustomerProjectItem) => project.id;

export const flattenCustomerProjects = (
  pages: Pick<ICustomerProjectPage, "items">[],
): ICustomerProjectItem[] => [
  ...new Map(pages.flatMap(page => page.items).map(project => [project.id, project])).values(),
];
