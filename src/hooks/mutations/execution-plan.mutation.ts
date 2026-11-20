import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../providers/query-client";
import { QUERY_ROOTS } from "../../constants/query-key.constant";
import { executionPlanService } from "../../services/execution-plan.service";
import type { IExecutionPlanSubmission } from "../../interfaces/execution-plan.interface";

const refreshExecutionPlans = async () => {
  await queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.EXECUTION_PLANS] });
};

export const useCreateExecutionPlanMutation = () =>
  useMutation({ mutationFn: executionPlanService.create, onSuccess: refreshExecutionPlans });

export const useUpdateExecutionPlanChecklistMutation = () =>
  useMutation({
    mutationFn: ({ submission, confirmedKeys }: {
      submission: IExecutionPlanSubmission;
      confirmedKeys: string[];
    }) =>
      executionPlanService.updateChecklist(submission, confirmedKeys),
    onSuccess: refreshExecutionPlans,
  });

export const useSubmitExecutionPlanMutation = () =>
  useMutation({ mutationFn: executionPlanService.submit, onSuccess: refreshExecutionPlans });

export const useDecideExecutionPlanMutation = () =>
  useMutation({
    mutationFn: ({ submission, decision, comment }: {
      submission: Parameters<typeof executionPlanService.decide>[0];
      decision: Parameters<typeof executionPlanService.decide>[1];
      comment: string;
    }) => executionPlanService.decide(submission, decision, comment),
    onSuccess: refreshExecutionPlans,
  });

export const useCancelExecutionPlanMutation = () =>
  useMutation({ mutationFn: executionPlanService.cancel, onSuccess: refreshExecutionPlans });
