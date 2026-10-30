import {
  NEW_TASK_COPY,
  TASK_PAGE_COPY,
  EMPTY_TASK_FORM,
  TASK_FILTER_IDS,
  TASKS_PAGE_COPY,
  TASK_LINK_KINDS,
  POOL_ASSIGNEE_ID,
  TASK_STATUS_TABS,
  TASK_HISTORY_COPY,
  TASK_STATUS_LABELS,
  TASK_STATUS_VALUES,
  URGENCY_CONFIRM_COPY,
  type TaskLinkKindType,
  TASK_LINK_KIND_LABELS,
  TASK_PROJECT_PICKER_COPY,
  TASK_HISTORY_PREVIEW_COUNT,
} from "../constants/task.constant";

import type {
  IApiTask,
  ITaskQuery,
  ITaskCounts,
  TTaskFormErrors,
  ITaskFormValues,
  ITaskLinkReader,
  ITaskLinkOption,
  ICreateTaskPayload,
  IApiTaskTransition,
  TTaskFormErrorEntry,
  IUrgencyConfirmation,
  IProjectCustomerSource,
} from "../interfaces/task.interface";

import moment from "moment";
import { formatDate } from "./date.utility";
import { getInitials } from "./text.utility";
import { isTaskStatus } from "./guards/task.guard";
import { getFullName } from "./mappers/user.mapper";
import { DATE_FORMAT } from "../constants/date.constants";
import { TASK_TYPES } from "../constants/task-type.constant";
import type { ITabItem } from "../interfaces/tab-item.interface";
import { buildCustomerPath, buildProjectPath } from "./route.utility";
import type { IApiUser, IApiProject, IApiCustomerReference } from "../interfaces/api.interface";

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
  if (!task.dueDate) {
    return TASKS_PAGE_COPY.NO_DUE;
  }

  if (isTaskOverdue(task)) {
    return `${TASKS_PAGE_COPY.OVERDUE} · ${formatDueDay(task)}`;
  }

  return formatDueDay(task);
};

export const formatTaskDueLabel = (task: IApiTask) => {
  if (!task.dueDate) {
    return TASKS_PAGE_COPY.NO_DUE;
  }

  if (isTaskOverdue(task)) {
    return `${TASKS_PAGE_COPY.OVERDUE} · ${formatDueDay(task)}`;
  }

  return `${TASKS_PAGE_COPY.DUE_PREFIX} ${formatDueDay(task)}`;
};

export const formatTaskDueFull = (task: IApiTask) => {
  if (!task.dueDate) {
    return TASKS_PAGE_COPY.NO_DUE;
  }

  const fullDate = formatDate(toDueDate(task), DATE_FORMAT.DATE_DOTS);

  if (isTaskOverdue(task)) {
    return `${fullDate} · ${TASKS_PAGE_COPY.OVERDUE}`;
  }

  return fullDate;
};

export const toDateInputValue = (date: string | null) =>
  date ? formatDate(new Date(date), DATE_FORMAT.DATE_INPUT) : "";

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

export const getTaskLinkKind = (task: IApiTask): TaskLinkKindType => {
  if (task.projectId) {
    return TASK_LINK_KINDS.PROJECT;
  }

  return TASK_LINK_KINDS.CUSTOMER;
};

export const getProjectCustomer = (project?: IProjectCustomerSource | null) =>
  project?.customer ?? project?.parentProject?.customer ?? null;

export const getTaskCustomer = (task: IApiTask): IApiCustomerReference | null =>
  getProjectCustomer(task.project) ?? task.customer ?? null;

const TASK_LINK_READERS: Record<TaskLinkKindType, ITaskLinkReader> = {
  project: {
    getId: task => task.projectId,
    buildPath: buildProjectPath,
    getContextCustomer: getTaskCustomer,
    getName: task => task.project?.name ?? task.projectId ?? "",
  },
  customer: {
    getId: task => task.customerId,
    buildPath: buildCustomerPath,
    getContextCustomer: () => null,
    getName: task => task.customer?.name ?? task.customerId ?? "",
  },
};

const getTaskLinkReader = (task: IApiTask) => TASK_LINK_READERS[getTaskLinkKind(task)];

export const getTaskLinkName = (task: IApiTask) => getTaskLinkReader(task).getName(task);

export const getTaskProjectCustomer = (task: IApiTask) =>
  getTaskLinkReader(task).getContextCustomer(task);

export const formatTaskLinkContext = (task: IApiTask) => {
  const projectCustomer = getTaskProjectCustomer(task);

  if (!projectCustomer) {
    return "";
  }

  return `· ${projectCustomer.name}`;
};

export const formatTaskLinkedToLabel = (task: IApiTask) =>
  `${TASK_PAGE_COPY.LINKED_TO}${TASK_LINK_KIND_LABELS[getTaskLinkKind(task)]}`;

export const buildTaskLinkPath = (task: IApiTask) => {
  const reader = getTaskLinkReader(task);
  const linkedId = reader.getId(task);

  if (!linkedId) {
    return null;
  }

  return reader.buildPath(linkedId);
};

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

export const canClaimTask = (task: IApiTask, canClaim: boolean) => !task.assigneeId && canClaim;

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

export const getTaskDueDateError = (dueDate: string) => {
  if (!dueDate) {
    return null;
  }

  const date = moment(dueDate, DATE_FORMAT.DATE_INPUT, true);
  if (!date.isValid()) {
    return NEW_TASK_COPY.INVALID_DUE;
  }

  if (date.isBefore(moment(), "day")) {
    return NEW_TASK_COPY.PAST_DUE;
  }

  return null;
};

export const getTaskFormErrors = (values: ITaskFormValues): TTaskFormErrors => {
  const errors: TTaskFormErrorEntry[] = [
    ["projectId", values.projectId ? null : TASK_PROJECT_PICKER_COPY.REQUIRED],
    ["assigneeOptionId", values.assigneeOptionId ? null : NEW_TASK_COPY.REQUIRED],
    ["title", values.title.trim() ? null : NEW_TASK_COPY.REQUIRED],
    ["dueDate", getTaskDueDateError(values.dueDate)],
    ["description", values.description.trim() ? null : NEW_TASK_COPY.REQUIRED],
  ];

  return Object.fromEntries(errors.filter(([, message]) => message !== null));
};

export const toCreateTaskPayload = (values: ITaskFormValues): ICreateTaskPayload | null => {
  if (!values.projectId) {
    return null;
  }

  return {
    taskType: TASK_TYPES.GENERAL,
    projectId: values.projectId,
    dueDate: values.dueDate || null,
    title: values.title.trim(),
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

export const formatUrgentSaveLead = (recipient: string) =>
  `בשמירה תישלח התראת Push אל ${recipient}`;

export const toInitialTaskFormValues = (project: IApiProject | null): ITaskFormValues => {
  if (!project) {
    return EMPTY_TASK_FORM;
  }

  return { ...EMPTY_TASK_FORM, projectId: project.id };
};

export const formatHistoryCount = (count: number) => {
  if (count === 1) {
    return "1 עדכון";
  }

  return `${count} עדכונים`;
};

export const getHistoryToggleCopy = ({
  isExpanded,
  total,
}: {
  isExpanded: boolean;
  total: number;
}) => {
  if (isExpanded) {
    return { caption: "", label: TASK_HISTORY_COPY.SHOW_LESS };
  }

  return {
    label: `הצג הכל (${total})`,
    caption: `עוד ${total - TASK_HISTORY_PREVIEW_COUNT} עדכונים ישנים יותר`,
  };
};

export const isHistoryPartial = (transitions: IApiTaskTransition[]) =>
  transitions.length > 0 && !transitions.some(transition => transition.fromStatus === null);

export const formatTransitionTime = (transition: IApiTaskTransition) =>
  formatTimestamp(transition.createdAt);

export const formatTransitionAuthor = (transition: IApiTaskTransition) =>
  formatPersonName(transition.changedBy);

export const getVisibleHistory = (transitions: IApiTaskTransition[], isExpanded: boolean) => {
  if (isExpanded) {
    return transitions;
  }

  return transitions.slice(0, TASK_HISTORY_PREVIEW_COUNT);
};

export const toProjectLinkOption = (project: IApiProject): ITaskLinkOption => ({
  id: project.id,
  name: project.name,
  caption: project.code,
  tag: project.projectType?.name ?? null,
});

export const findLinkOption = (options: ITaskLinkOption[], optionId: string) =>
  options.find(option => option.id === optionId) ?? null;
