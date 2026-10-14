import {
  NEW_TASK_COPY,
  TASK_PAGE_COPY,
  EMPTY_TASK_FORM,
  TASK_FILTER_IDS,
  TASKS_PAGE_COPY,
  POOL_ASSIGNEE_ID,
  TASK_STATUS_TABS,
  TASK_STATUS_LABELS,
  TASK_STATUS_VALUES,
  URGENCY_CONFIRM_COPY,
} from "../constants/task.constant";

import type {
  IApiTask,
  ITaskQuery,
  ITaskCounts,
  TTaskFormErrors,
  ITaskFormValues,
  ICreateTaskPayload,
  IUrgencyConfirmation,
} from "../interfaces/task.interface";

import moment from "moment";
import { formatDate } from "./date.utility";
import { getInitials } from "./text.utility";
import { isTaskStatus } from "./guards/task.guard";
import { getFullName } from "./mappers/user.mapper";
import { DATE_FORMAT } from "../constants/date.constants";
import type { ITabItem } from "../interfaces/tab-item.interface";
import type { IApiUser, IApiProject } from "../interfaces/api.interface";

const toDueDate = (task: IApiTask) => (task.dueDate ? new Date(task.dueDate) : null);

export const isTaskOverdue = (task: IApiTask) => {
  const dueDate = toDueDate(task);

  if (!dueDate) {
    return false;
  }

  return moment(dueDate).isBefore(moment(), "day");
};

const formatDueDay = (task: IApiTask) => formatDate(toDueDate(task), DATE_FORMAT.DATE_DOTS_NO_YEAR);

export const formatTaskDueShort = (task: IApiTask) => {
  if (isTaskOverdue(task)) {
    return `${TASKS_PAGE_COPY.OVERDUE} · ${formatDueDay(task)}`;
  }

  return formatDueDay(task);
};

export const formatTaskDueLabel = (task: IApiTask) => {
  if (isTaskOverdue(task)) {
    return `${TASKS_PAGE_COPY.OVERDUE} · ${formatDueDay(task)}`;
  }

  return `${TASKS_PAGE_COPY.DUE_PREFIX} ${formatDueDay(task)}`;
};

export const formatTaskDueFull = (task: IApiTask) => {
  const fullDate = formatDate(toDueDate(task), DATE_FORMAT.DATE_DOTS);

  if (isTaskOverdue(task)) {
    return `${fullDate} · ${TASKS_PAGE_COPY.OVERDUE}`;
  }

  return fullDate;
};

export const toDateInputValue = (date: string | null) =>
  formatDate(date ? new Date(date) : null, DATE_FORMAT.DATE_INPUT);

export const getTodayInputValue = () => formatDate(new Date(), DATE_FORMAT.DATE_INPUT);

export const formatAssigneeLabel = (task: IApiTask) => {
  if (!task.assignee) {
    return TASKS_PAGE_COPY.POOL;
  }

  return getFullName(task.assignee);
};

export const getAssigneeInitials = (task: IApiTask) => {
  if (!task.assignee) {
    return "—";
  }

  return getInitials(getFullName(task.assignee));
};

export const formatTaskContext = (task: IApiTask) =>
  [task.project?.name, task.customer?.name].filter(Boolean).join(" · ");

const formatPersonName = (user?: IApiUser | null) => (user ? getFullName(user) : "—");

const formatTimestamp = (value: string | null) =>
  formatDate(value ? new Date(value) : null, DATE_FORMAT.FULL_DATE);

export const formatTaskCreatedCaption = (task: IApiTask) =>
  `נוצרה ע״י ${formatPersonName(task.createdBy)} · ${formatTimestamp(task.createdAt)}`;

export const formatUrgencyText = (task: IApiTask) => {
  if (!task.isUrgent) {
    return TASK_PAGE_COPY.REGULAR_TEXT;
  }

  return `סומנה ע״י ${formatPersonName(task.urgencyMarkedBy)} · ${formatTimestamp(task.urgencyMarkedAt)}`;
};

export const canClaimTask = (task: IApiTask, isManager: boolean) => !task.assigneeId && !isManager;

export const toTaskTabs = (counts: ITaskCounts | null): ITabItem[] => [
  { id: TASK_FILTER_IDS.ALL, label: TASKS_PAGE_COPY.ALL, count: counts?.total ?? 0 },
  { id: TASK_FILTER_IDS.URGENT, label: TASKS_PAGE_COPY.URGENT, count: counts?.urgent ?? 0 },
  ...TASK_STATUS_TABS.map(tab => ({ ...tab, count: counts?.byStatus[tab.id] ?? 0 })),
];

export const toTaskQuery = (filterId: string, search: string): ITaskQuery => ({
  search,
  isUrgent: filterId === TASK_FILTER_IDS.URGENT ? true : null,
  status: isTaskStatus(filterId) ? filterId : null,
});

export const formatTaskSummary = ({ visible, total }: { visible: number; total: number }) =>
  `מציג ${visible} מתוך ${total} משימות · ${TASKS_PAGE_COPY.ORDER_NOTE}`;

export const formatProjectTasksSubtitle = (count: number) => `${count} משימות`;

export const toAssigneeOptions = (users: IApiUser[]) => [
  { id: POOL_ASSIGNEE_ID, label: NEW_TASK_COPY.POOL_OPTION },
  ...users.map(user => ({ id: user.id, label: getFullName(user) })),
];

export const toAssigneeId = (optionId: string | null) => {
  if (optionId === POOL_ASSIGNEE_ID) {
    return null;
  }

  return optionId;
};

export const toAssigneeOptionId = (assigneeId: string | null) => assigneeId ?? POOL_ASSIGNEE_ID;

const isPastDate = (dateInput: string) => moment(dateInput).isBefore(moment(), "day");

const getDueDateError = (dueDate: string) => {
  if (!dueDate) {
    return NEW_TASK_COPY.REQUIRED;
  }

  if (isPastDate(dueDate)) {
    return NEW_TASK_COPY.PAST_DUE;
  }

  return null;
};

export const getTaskFormErrors = (values: ITaskFormValues): TTaskFormErrors => {
  const errors: [keyof TTaskFormErrors, string | null][] = [
    ["projectId", values.projectId ? null : NEW_TASK_COPY.CHOOSE_PROJECT],
    ["customerId", values.customerId ? null : NEW_TASK_COPY.REQUIRED],
    ["assigneeOptionId", values.assigneeOptionId ? null : NEW_TASK_COPY.REQUIRED],
    ["title", values.title.trim() ? null : NEW_TASK_COPY.REQUIRED],
    ["dueDate", getDueDateError(values.dueDate)],
    ["description", values.description.trim() ? null : NEW_TASK_COPY.REQUIRED],
  ];

  return Object.fromEntries(errors.filter(([, message]) => message !== null));
};

export const toCreateTaskPayload = (values: ITaskFormValues): ICreateTaskPayload | null => {
  if (!values.projectId || !values.customerId) {
    return null;
  }

  return {
    dueDate: values.dueDate,
    title: values.title.trim(),
    projectId: values.projectId,
    customerId: values.customerId,
    assigneeId: toAssigneeId(values.assigneeOptionId),
    description: values.description.trim(),
  };
};

export const formatUrgencyRecipient = (assignee?: IApiUser | null) => {
  if (!assignee) {
    return URGENCY_CONFIRM_COPY.ENGINEERING_TEAM;
  }

  return getFullName(assignee);
};

export const getUrgencyConfirmationBody = (confirmation: IUrgencyConfirmation) => {
  if (confirmation.kind === "clear") {
    return URGENCY_CONFIRM_COPY.CLEAR_BODY;
  }

  if (confirmation.isBeforeSave) {
    return `המשימה תסומן כדחופה ותישלח התראת Push מיידית אל ${confirmation.recipient} ברגע שתשמור אותה. את ההתראה אי אפשר לבטל אחרי שנשלחה.`;
  }

  return `המשימה תסומן כדחופה לכולם ותישלח התראת Push מיידית אל ${confirmation.recipient}. את ההתראה אי אפשר לבטל אחרי שנשלחה.`;
};

export const formatUrgencyPreviewTitle = (taskTitle: string) =>
  `${URGENCY_CONFIRM_COPY.PREVIEW_TITLE_PREFIX} ${taskTitle.trim() || URGENCY_CONFIRM_COPY.NEW_TASK}`;

export const formatUrgencyPreviewSender = (recipient: string) =>
  `${URGENCY_CONFIRM_COPY.PREVIEW_PREFIX} ${recipient}`;

export const findTaskStatusByLabel = (label: string | null) =>
  TASK_STATUS_VALUES.find(status => TASK_STATUS_LABELS[status] === label) ?? null;

export const countTaskFormErrors = (values: ITaskFormValues) =>
  Object.keys(getTaskFormErrors(values)).length;

export const getAssigneeHint = (assigneeOptionId: string | null) => {
  if (assigneeOptionId === POOL_ASSIGNEE_ID) {
    return NEW_TASK_COPY.POOL_HINT;
  }

  return null;
};

export const getCustomerHint = (isCustomerFromProject: boolean) => {
  if (isCustomerFromProject) {
    return NEW_TASK_COPY.CUSTOMER_FROM_PROJECT;
  }

  return null;
};

export const formatUrgentSaveLead = (recipient: string) =>
  `בשמירה תישלח התראת Push אל ${recipient}`;

export const toProjectSelection = (project: IApiProject | null): Partial<ITaskFormValues> => {
  if (!project?.customerId) {
    return { projectId: project?.id ?? null, isCustomerFromProject: false };
  }

  return { projectId: project.id, customerId: project.customerId, isCustomerFromProject: true };
};

export const toInitialTaskFormValues = (project: IApiProject | null): ITaskFormValues => ({
  ...EMPTY_TASK_FORM,
  ...toProjectSelection(project),
});
