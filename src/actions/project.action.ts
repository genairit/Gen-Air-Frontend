import { getSession } from "../store/session.store";
import { queryClient } from "../providers/query-client";
import { projectService } from "../services/project.service";
import { QUERY_ROOTS } from "../constants/query-key.constant";
import { toProjectPayload } from "../utilities/project.utility";
import { AuthorizationContext } from "../managers/authorization-context.manager";
import { toAuthorizedProjectUpdate } from "../utilities/project-permission.utility";
import type { IStageMove, IProjectSubmission } from "../interfaces/project.interface";

const invalidateProjectQueries = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECT_NAME_AVAILABILITY] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECTS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.CUSTOMER_PROJECTS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.STAGE_COUNTS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECT] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.TRANSITIONS] }),
  ]);

const requirePayload = (submission: IProjectSubmission) => {
  const payload = toProjectPayload(submission);

  if (!payload) {
    throw new Error("A project type is required before saving");
  }

  return payload;
};

export const createProjectAction = async (submission: IProjectSubmission): Promise<string> => {
  const context = new AuthorizationContext();
  const project = await projectService.create({
    ...requirePayload(submission),
    contacts: submission.contacts ?? [],
  });
  context.assertCurrent();

  await invalidateProjectQueries();
  context.assertCurrent();

  return project.id;
};

export const updateProjectAction = async ({
  projectId,
  ...submission
}: IProjectSubmission & { projectId: string }): Promise<string> => {
  const context = new AuthorizationContext();
  const payload = toAuthorizedProjectUpdate(requirePayload(submission), getSession()?.user ?? null);
  const project = await projectService.update(projectId, payload);
  context.assertCurrent();

  await invalidateProjectQueries();
  context.assertCurrent();

  return project.id;
};

export const deleteProjectAction = async (projectId: string): Promise<void> => {
  const context = new AuthorizationContext();
  await projectService.delete(projectId);
  context.assertCurrent();
  await invalidateProjectQueries();
  context.assertCurrent();
};

export const moveProjectToStageAction = async ({
  projectId,
  ...move
}: IStageMove & { projectId: string }): Promise<void> => {
  const context = new AuthorizationContext();

  try {
    await projectService.moveToStage(projectId, move);
  } finally {
    if (context.isCurrent()) {
      await invalidateProjectQueries();
    }
  }

  context.assertCurrent();
};

export const refreshProjectQueriesAction = invalidateProjectQueries;
