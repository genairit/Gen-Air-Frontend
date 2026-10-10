import {
  toCustomerDetailValues,
  toCustomerDetailsPayload,
  createEmptyCustomerDetailValues,
} from "./customer-details.utility";

import type {
  IBoardColumn,
  TRoleAssignees,
  IProjectFormValues,
} from "../interfaces/project.interface";

import { mapUserRoles } from "./user-role.utility";
import type { IApiProject } from "../interfaces/api.interface";
import type { IProjectPayload } from "../interfaces/api-request.interface";
import { USER_ROLE_VALUES, type UserRoleType } from "../constants/user-role.constant";
import type { ProjectDetailFieldSetType } from "../constants/project-detail-field-set.constant";

export const getProjectsInStage = (projects: IApiProject[], stageId: string) =>
  projects.filter(project => project.stageId === stageId);

export const moveProjectInList = (
  projects: IApiProject[],
  { projectId, stageId }: { projectId: string; stageId: string },
) => projects.map(project => (project.id === projectId ? { ...project, stageId } : project));

export const getVisibleBoardColumns = (columns: IBoardColumn[], stageId: string | null) => {
  if (!stageId) {
    return columns;
  }

  return columns.filter(column => column.stageId === stageId);
};

const createEmptyAssignees = (): TRoleAssignees => mapUserRoles(() => null);

const findMemberUserId = (project: IApiProject, role: UserRoleType) =>
  project.members?.find(member => member.role === role)?.userId ?? null;

const toAssignees = (project: IApiProject): TRoleAssignees =>
  mapUserRoles(role => findMemberUserId(project, role));

export const toProjectFormValues = (project: IApiProject | null): IProjectFormValues => {
  if (!project) {
    return {
      name: "",
      typeId: null,
      stageId: null,
      assignees: createEmptyAssignees(),
      customerDetails: createEmptyCustomerDetailValues(),
    };
  }

  return {
    name: project.name,
    stageId: project.stageId,
    typeId: project.projectTypeId,
    assignees: toAssignees(project),
    customerDetails: toCustomerDetailValues(project),
  };
};

const toMemberAssignments = (assignees: TRoleAssignees) =>
  USER_ROLE_VALUES.flatMap(role => {
    const userId = assignees[role];

    return userId ? [{ role, userId }] : [];
  });

export const canSubmitProjectForm = (values: IProjectFormValues) =>
  Boolean(values.name.trim()) && Boolean(values.typeId);

export const toProjectPayload = (
  values: IProjectFormValues,
  fieldSet: ProjectDetailFieldSetType | null,
): IProjectPayload | null => {
  if (!values.typeId) {
    return null;
  }

  return {
    ...toCustomerDetailsPayload(values.customerDetails, fieldSet),
    name: values.name.trim(),
    projectTypeId: values.typeId,
    members: toMemberAssignments(values.assignees),
    ...(values.stageId ? { stageId: values.stageId } : {}),
  };
};
