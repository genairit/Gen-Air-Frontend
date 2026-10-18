import { queryClient } from "../providers/query-client";
import { projectService } from "../services/project.service";
import { QUERY_ROOTS } from "../constants/query-key.constant";
import { toProjectPayload } from "../utilities/project.utility";
import type { IProjectSubmission } from "../interfaces/project.interface";

const invalidateProjectQueries = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECTS] }),
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

export const createProjectAction = async (submission: IProjectSubmission) => {
  const project = await projectService.create(requirePayload(submission));

  await invalidateProjectQueries();

  return project.id;
};

export const updateProjectAction = async ({
  projectId,
  ...submission
}: IProjectSubmission & { projectId: string }) => {
  const project = await projectService.update(projectId, requirePayload(submission));

  await invalidateProjectQueries();

  return project.id;
};

export const deleteProjectAction = async (projectId: string) => {
  await projectService.delete(projectId);
  await invalidateProjectQueries();
};

export const moveProjectToStageAction = async ({
  projectId,
  stageId,
}: {
  projectId: string;
  stageId: string;
}) => {
  await projectService.moveToStage(projectId, stageId);
};

export const refreshProjectQueriesAction = invalidateProjectQueries;
