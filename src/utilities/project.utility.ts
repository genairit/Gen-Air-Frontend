import {
  toCustomerDetailValues,
  toCustomerDetailsPayload,
  createEmptyCustomerDetailValues,
} from "./customer-details.utility";

import type {
  TRoleAssignees,
  IProjectFormValues,
  IProjectSubmission,
} from "../interfaces/project.interface";

import { mapUserRoles } from "./user-role.utility";
import { BOARD_COPY } from "../constants/board.constant";
import type { IProjectPayload } from "../interfaces/api-request.interface";
import type { IApiProject, IApiProjectStage } from "../interfaces/api.interface";
import { USER_ROLE_VALUES, type UserRoleType } from "../constants/user-role.constant";
import { toIntakeValues, toIntakePayload, createEmptyIntakeValues } from "./project-intake.utility";

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
      customerId: null,
      assignees: createEmptyAssignees(),
      ...createEmptyIntakeValues(),
      customerDetails: createEmptyCustomerDetailValues(),
    };
  }

  return {
    name: project.name,
    stageId: project.stageId,
    typeId: project.projectTypeId,
    customerId: project.customerId,
    assignees: toAssignees(project),
    ...toIntakeValues(project),
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

export const countMissingCustomer = (values: IProjectFormValues) => (values.customerId ? 0 : 1);

export const toProjectPayload = ({
  values,
  fieldSet,
  originalIntake,
}: IProjectSubmission): IProjectPayload | null => {
  if (!values.typeId || !values.customerId) {
    return null;
  }

  return {
    ...toCustomerDetailsPayload(values.customerDetails, fieldSet),
    ...toIntakePayload(values, originalIntake),
    name: values.name.trim(),
    projectTypeId: values.typeId,
    customerId: values.customerId,
    members: toMemberAssignments(values.assignees),
    ...(values.stageId ? { stageId: values.stageId } : {}),
  };
};

export const formatProjectCustomer = (project: IApiProject) =>
  project.customer?.name ?? project.customerName ?? BOARD_COPY.NO_CUSTOMER;

export const formatVisibleProjects = ({ visible, total }: { visible: number; total: number }) =>
  `מציג ${visible} מתוך ${total} פרויקטים`;

export const findStageByName = (stages: IApiProjectStage[], name: string | null) =>
  stages.find(stage => stage.name === name) ?? null;
