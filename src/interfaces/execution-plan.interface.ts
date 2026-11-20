import type { ExecutionPlanStatusType } from "../constants/execution-plan.constant";

export interface IExecutionPlanChecklistItem {
  key: string;
  label: string;
  confirmed: boolean;
}

export interface IExecutionPlanTemplate {
  id: string;
  version: number;
  items: Array<{ key: string; label: string }>;
  createdAt: string;
}

export interface IExecutionPlanSubmission {
  id: string;
  quotationId: string;
  projectId: string;
  driveFileId: string;
  driveFileVersion: string;
  driveFileName: string;
  planVersion: string;
  templateVersion: number;
  checklist: IExecutionPlanChecklistItem[];
  status: ExecutionPlanStatusType;
  revision: number;
  submittedById: string;
  submittedAt: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  returnComment: string | null;
  supersedesId: string | null;
  createdAt: string;
  updatedAt: string;
  quotation?: { id: string; number: string };
  project?: { id: string; name: string; code: string; parentProjectId: string | null };
  submitter?: { id: string; firstName: string; lastName: string };
  reviewer?: { id: string; firstName: string; lastName: string };
}

export interface IExecutionPlanPendingPage {
  rows: IExecutionPlanSubmission[];
  count: number;
}

export interface ICreateExecutionPlanPayload {
  quotationId: string;
  projectId: string;
  driveFileId: string;
  planVersion: string;
  supersedesId?: string;
}
