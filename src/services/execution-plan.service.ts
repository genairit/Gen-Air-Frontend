import type {
  ICreateExecutionPlanPayload,
  IExecutionPlanSubmission,
} from "../interfaces/execution-plan.interface";

import { isArrayOf } from "../utilities/guards/primitive.guard";
import { API_ENDPOINTS } from "../constants/api.constant";
import { httpClient, ensureResponse } from "./http-client.service";
import {
  isExecutionPlanTemplate,
  isExecutionPlanSubmission,
  isExecutionPlanPendingPage,
} from "../utilities/guards/execution-plan.guard";

export const executionPlanService = {
  async template() {
    const endpoint = API_ENDPOINTS.EXECUTION_PLAN_TEMPLATE;
    const response = await httpClient.get<unknown>(endpoint);
    return ensureResponse(endpoint, response.data, isExecutionPlanTemplate);
  },

  async pending() {
    const endpoint = API_ENDPOINTS.EXECUTION_PLAN_PENDING;
    const response = await httpClient.get<unknown>(endpoint);
    return ensureResponse(endpoint, response.data, isExecutionPlanPendingPage);
  },

  async forQuotation(quotationId: string) {
    const endpoint = API_ENDPOINTS.executionPlansForQuotation(quotationId);
    const response = await httpClient.get<unknown>(endpoint);
    return ensureResponse(endpoint, response.data, isArrayOf(isExecutionPlanSubmission));
  },

  async ownDraftForFile(projectId: string, fileId: string) {
    const endpoint = API_ENDPOINTS.executionPlanDraftForFile(projectId, fileId);
    const response = await httpClient.get<unknown>(endpoint);
    return ensureResponse(
      endpoint,
      response.data,
      (value): value is IExecutionPlanSubmission | null =>
        value === null || isExecutionPlanSubmission(value),
    );
  },

  async create(payload: ICreateExecutionPlanPayload) {
    const endpoint = API_ENDPOINTS.EXECUTION_PLANS;
    const response = await httpClient.post<unknown>(endpoint, payload);
    return ensureResponse(endpoint, response.data, isExecutionPlanSubmission);
  },

  async updateChecklist(submission: IExecutionPlanSubmission, confirmedKeys: string[]) {
    const endpoint = API_ENDPOINTS.executionPlanChecklist(submission.id);
    const response = await httpClient.patch<unknown>(endpoint, {
      revision: submission.revision,
      confirmedKeys,
    });
    return ensureResponse(endpoint, response.data, isExecutionPlanSubmission);
  },

  async submit(submission: IExecutionPlanSubmission) {
    const endpoint = API_ENDPOINTS.executionPlanSubmit(submission.id);
    const response = await httpClient.post<unknown>(endpoint, { revision: submission.revision });
    return ensureResponse(endpoint, response.data, isExecutionPlanSubmission);
  },

  async decide(
    submission: IExecutionPlanSubmission,
    decision: "approve" | "return",
    comment: string,
  ) {
    const endpoint = API_ENDPOINTS.executionPlanDecision(submission.id);
    const response = await httpClient.post<unknown>(endpoint, {
      revision: submission.revision,
      decision,
      comment,
    });
    return ensureResponse(endpoint, response.data, isExecutionPlanSubmission);
  },

  async cancel(submission: IExecutionPlanSubmission) {
    const endpoint = API_ENDPOINTS.executionPlanCancel(submission.id);
    const response = await httpClient.post<unknown>(endpoint, { revision: submission.revision });
    return ensureResponse(endpoint, response.data, isExecutionPlanSubmission);
  },
};
