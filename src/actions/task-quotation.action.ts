import { logger } from "../utilities/logger.utility";
import { taskService } from "../services/task.service";
import { queryClient } from "../providers/query-client";
import type { NavigateFunction } from "react-router-dom";
import { buildQuotationPath } from "../utilities/route.utility";
import { QUOTATION_QUERY_KEY } from "../constants/quotation.constant";
import { TASK_QUOTATION_KEYS } from "../constants/task-quotation.constant";
import { AuthorizationContext } from "../managers/authorization-context.manager";
import { QUOTATION_SHARING_KEYS } from "../constants/quotation-sharing.constant";

interface ICreateTaskQuotation {
  taskId: string;
  navigate: NavigateFunction;
}

export const createTaskQuotationAction = async ({ taskId, navigate }: ICreateTaskQuotation) => {
  const context = new AuthorizationContext();
  try {
    const result = await taskService.createQuotation(taskId);
    context.assertCurrent();
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [TASK_QUOTATION_KEYS.ROOT] }),
      queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: [QUOTATION_SHARING_KEYS.PROJECT_QUOTATIONS_ROOT] }),
    ]);
    context.assertCurrent();
    await navigate(buildQuotationPath(result.quotationId));
    return result;
  } catch (error) {
    logger.error("Task quotation creation failed", { error });
    throw error;
  }
};
