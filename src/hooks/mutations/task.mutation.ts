import {
  claimTaskAction,
  createTaskAction,
  deleteTaskAction,
  updateTaskAction,
  updateTaskStatusAction,
  updateTaskUrgencyAction,
} from "../../actions/task.action";

import { useIsMutating, useMutation } from "@tanstack/react-query";
import { TASK_STATUS_MUTATION_KEY } from "../../constants/task.constant";

export const useCreateTaskMutation = () => useMutation({ mutationFn: createTaskAction });

export const useUpdateTaskMutation = () => useMutation({ mutationFn: updateTaskAction });

export const useDeleteTaskMutation = () => useMutation({ mutationFn: deleteTaskAction });

export const useClaimTaskMutation = () => useMutation({ mutationFn: claimTaskAction });

export const useUpdateTaskStatusMutation = () =>
  useMutation({ mutationKey: TASK_STATUS_MUTATION_KEY, mutationFn: updateTaskStatusAction });

export const useUpdateTaskUrgencyMutation = () =>
  useMutation({ mutationFn: updateTaskUrgencyAction });

export const useIsTaskStatusPending = (taskId: string) =>
  useIsMutating({
    mutationKey: TASK_STATUS_MUTATION_KEY,
    predicate: mutation => {
      const variables: unknown = mutation.state.variables;
      return (
        typeof variables === "object" &&
        variables !== null &&
        "taskId" in variables &&
        variables.taskId === taskId
      );
    },
  }) > 0;
