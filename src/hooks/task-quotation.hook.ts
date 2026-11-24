import { useNavigate } from "react-router-dom";
import { useRef, type MouseEvent } from "react";
import { useElementFocus } from "./element-focus.hook";
import { taskService } from "../services/task.service";
import { useSessionUser } from "../store/session.store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PERMISSIONS } from "../constants/permission.constant";
import { hasPermission } from "../utilities/permission.utility";
import { TASK_QUOTATION_KEYS } from "../constants/task-quotation.constant";
import { SessionRequestManager } from "../managers/session-request.manager";
import { createTaskQuotationAction } from "../actions/task-quotation.action";
import { AuthorizationContext } from "../managers/authorization-context.manager";

export const useTaskQuotations = (taskId: string) => {
  const navigate = useNavigate();
  const user = useSessionUser();
  const pending = useRef(false);
  const actionElement = useRef<HTMLButtonElement | null>(null);
  const generation = SessionRequestManager.getAuthorizationGeneration();
  const canRead =
    hasPermission(user, PERMISSIONS.QUOTATIONS_READ) && hasPermission(user, PERMISSIONS.TASKS_READ);
  const canCreate = hasPermission(user, PERMISSIONS.QUOTATIONS_CREATE);
  const query = useQuery({
    enabled: canRead,
    queryKey: TASK_QUOTATION_KEYS.context(taskId, generation),
    queryFn: async () => {
      const context = new AuthorizationContext();
      const result = await taskService.getQuotations(taskId);
      context.assertCurrent();
      return result;
    },
  });
  const mutation = useMutation({
    mutationKey: TASK_QUOTATION_KEYS.context(taskId, generation),
    mutationFn: () => createTaskQuotationAction({ taskId, navigate }),
  });
  useElementFocus(actionElement, mutation.isError);
  const create = async (event?: MouseEvent<HTMLButtonElement>) => {
    if (pending.current || !canRead || !canCreate || !query.data?.canCreate) {
      return;
    }

    actionElement.current = event?.currentTarget ?? null;
    pending.current = true;
    try {
      await mutation.mutateAsync();
    } catch {
      // The action logs the failure; the mutation renders its retryable error.
    } finally {
      pending.current = false;
    }
  };

  return { query, mutation, create, canRead, canCreate };
};
