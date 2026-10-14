import {
  claimTaskAction,
  createTaskAction,
  deleteTaskAction,
  updateTaskAction,
  updateTaskStatusAction,
  updateTaskUrgencyAction,
} from "../../actions/task.action";

import { useMutation } from "@tanstack/react-query";

export const useCreateTaskMutation = () => useMutation({ mutationFn: createTaskAction });

export const useUpdateTaskMutation = () => useMutation({ mutationFn: updateTaskAction });

export const useDeleteTaskMutation = () => useMutation({ mutationFn: deleteTaskAction });

export const useClaimTaskMutation = () => useMutation({ mutationFn: claimTaskAction });

export const useUpdateTaskStatusMutation = () =>
  useMutation({ mutationFn: updateTaskStatusAction });

export const useUpdateTaskUrgencyMutation = () =>
  useMutation({ mutationFn: updateTaskUrgencyAction });
