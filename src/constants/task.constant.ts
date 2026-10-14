export const TASK_STATUSES = {
  NOT_STARTED: "not_started",
  WAITING_FOR_RESPONSE: "waiting_for_response",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "in_review",
  PROPOSAL_SENT: "proposal_sent",
} as const;

export type TaskStatusType = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];
export const TASK_STATUS_VALUES = Object.values(TASK_STATUSES);
export const TASK_STATUS_LABELS: Record<TaskStatusType, string> = {
  not_started: "טרם בעבודה",
  waiting_for_response: "מחכה לתשובה",
  in_progress: "בעבודה",
  in_review: "בבדיקה",
  proposal_sent: "נשלחה הצעה",
};
