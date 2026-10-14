import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
  moveProjectToStageAction,
  refreshProjectQueriesAction,
} from "../../actions/project.action";

import { useMutation } from "@tanstack/react-query";
import { uploadProjectFilesAction } from "../../actions/drive.action";
import { clearProjectDraft } from "../../utilities/project-draft.utility";

export const useMoveProjectStageMutation = () =>
  useMutation({ mutationFn: moveProjectToStageAction, onSettled: refreshProjectQueriesAction });

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
