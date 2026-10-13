import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
  moveProjectToStageAction,
  refreshProjectQueriesAction,
} from "../../actions/project.action";

import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../providers/query-client";
import { QUERY_KEYS } from "../../constants/query-key.constant";
import type { IApiProject } from "../../interfaces/api.interface";
import { moveProjectInList } from "../../utilities/project.utility";
import { uploadProjectFilesAction } from "../../actions/drive.action";
import { clearProjectDraft } from "../../utilities/project-draft.utility";
import type { IProjectQuery } from "../../interfaces/api-request.interface";

interface IProjectMove {
  stageId: string;
  projectId: string;
}

export const useMoveProjectMutation = (query: IProjectQuery) => {
  const queryKey = QUERY_KEYS.projects(query);

  return useMutation({
    mutationFn: moveProjectToStageAction,
    onSettled: refreshProjectQueriesAction,
    onMutate: async (move: IProjectMove) => {
      await queryClient.cancelQueries({ queryKey });

      const previousProjects = queryClient.getQueryData<IApiProject[]>(queryKey) ?? null;

      if (previousProjects) {
        queryClient.setQueryData(queryKey, moveProjectInList(previousProjects, move));
      }

      return { previousProjects };
    },
    onError: (_error, _move, context) => {
      if (!context?.previousProjects) {
        return;
      }

      queryClient.setQueryData(queryKey, context.previousProjects);
    },
  });
};

export const useCreateProjectMutation = (draftUserId: string | null = null) =>
  useMutation({
    mutationFn: createProjectAction,
    onMutate: () => draftUserId,
    onSuccess: (_savedId, _values, userId) => clearProjectDraft(userId ?? null),
  });

export const useUpdateProjectMutation = () => useMutation({ mutationFn: updateProjectAction });

export const useDeleteProjectMutation = () => useMutation({ mutationFn: deleteProjectAction });

export const useUploadProjectFilesMutation = () =>
  useMutation({ mutationFn: uploadProjectFilesAction });
