import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../constants/query-key.constant";
import { executionPlanService } from "../../services/execution-plan.service";

export const useExecutionPlanTemplateQuery = (enabled: boolean) =>
  useQuery({
    enabled,
    queryKey: QUERY_KEYS.executionPlanTemplate(),
    queryFn: executionPlanService.template,
  });

export const usePendingExecutionPlansQuery = (enabled: boolean) =>
  useQuery({
    enabled,
    queryKey: QUERY_KEYS.executionPlanPending(),
    queryFn: executionPlanService.pending,
  });

export const useQuotationExecutionPlansQuery = (quotationId: string, enabled: boolean) =>
  useQuery({
    enabled,
    queryKey: QUERY_KEYS.executionPlansForQuotation(quotationId),
    queryFn: () => executionPlanService.forQuotation(quotationId),
  });

export const useExecutionPlanDraftForFileQuery = (projectId: string, fileId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.executionPlanDraftForFile(projectId, fileId),
    queryFn: () => executionPlanService.ownDraftForFile(projectId, fileId),
  });
