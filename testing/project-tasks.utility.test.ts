import {
  isTaskOverdue,
  getTaskLinkKind,
  getTaskLinkName,
  getTaskCustomer,
  toDateInputValue,
  findTaskAssignee,
  buildTaskLinkPath,
  formatTaskDueFull,
  getTaskFormErrors,
  formatTaskDueShort,
  formatTaskDueLabel,
  toCreateTaskPayload,
  countTaskFormErrors,
  formatTransitionAuthor,
  toInitialTaskFormValues,
  toProjectTaskAssigneeOptions,
} from "../src/utilities/task.utility";

import moment from "moment";
import { test } from "node:test";
import assert from "node:assert/strict";
import { DATE_FORMAT } from "../src/constants/date.constants";
import { TASK_STATUSES } from "../src/constants/task.constant";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { TASK_TYPES } from "../src/constants/task-type.constant";
import { createTask, project, engineer } from "./project-tasks.fixture";
import type { ITaskFormValues } from "../src/interfaces/task.interface";
import { isApiTask, isApiTaskTransition } from "../src/utilities/guards/task.guard";
import { EMPTY_TASK_FORM, POOL_ASSIGNEE_ID, TASK_LINK_KINDS } from "../src/constants/task.constant";

const formValues: ITaskFormValues = {
  ...EMPTY_TASK_FORM,
  projectId: project.id,
  title: "  טיפול בפרויקט  ",
  description: "  תיאור העבודה  ",
  assigneeOptionId: POOL_ASSIGNEE_ID,
};

test("manual task payload selects only the project and General type, ignoring stale hidden choices", () => {
  const staleDraft = {
    ...formValues,
    customerId: "old-customer",
    linkKind: TASK_LINK_KINDS.CUSTOMER,
    taskType: TASK_TYPES.QUOTATION,
  };
  assert.deepEqual(toCreateTaskPayload(staleDraft), {
    projectId: project.id,
    taskType: TASK_TYPES.GENERAL,
    title: "טיפול בפרויקט",
    description: "תיאור העבודה",
    assigneeId: null,
    dueDate: null,
  });
  assert.deepEqual(getTaskFormErrors(staleDraft), {});
});

test("a customer-only or missing-project draft cannot create a new task", () => {
  const missingProject = { ...formValues, projectId: null, customerId: "old-customer" };
  assert.equal(toCreateTaskPayload(missingProject), null);
  assert.equal(getTaskFormErrors(missingProject).projectId, "בחר פרויקט");
  assert.equal(countTaskFormErrors(missingProject), 1);
});

test("blank due date is optional but required content and assignment choice stay validated", () => {
  assert.deepEqual(getTaskFormErrors(formValues), {});
  assert.equal(countTaskFormErrors(formValues), 0);
  const emptyContent = { ...formValues, title: " ", description: " ", assigneeOptionId: null };
  assert.deepEqual(Object.keys(getTaskFormErrors(emptyContent)).sort(), [
    "assigneeOptionId",
    "description",
    "title",
  ]);
});

test("supplied due dates accept today/future and reject past or invalid calendar dates", () => {
  const today = moment().format(DATE_FORMAT.DATE_INPUT);
  const tomorrow = moment().add(1, "day").format(DATE_FORMAT.DATE_INPUT);
  const yesterday = moment().subtract(1, "day").format(DATE_FORMAT.DATE_INPUT);
  assert.deepEqual(getTaskFormErrors({ ...formValues, dueDate: today }), {});
  assert.deepEqual(getTaskFormErrors({ ...formValues, dueDate: tomorrow }), {});
  assert.ok(getTaskFormErrors({ ...formValues, dueDate: yesterday }).dueDate);
  assert.ok(getTaskFormErrors({ ...formValues, dueDate: "2026-02-31" }).dueDate);
  assert.ok(getTaskFormErrors({ ...formValues, dueDate: "not-a-date" }).dueDate);
  assert.equal(toCreateTaskPayload({ ...formValues, dueDate: tomorrow })?.dueDate, tomorrow);
});

test("initial project context is selected without storing a second customer association", () => {
  const initial = toInitialTaskFormValues(project);
  assert.equal(initial.projectId, project.id);
  assert.equal("customerId" in initial, false);
  assert.equal("linkKind" in initial, false);
  assert.equal(toInitialTaskFormValues(null).projectId, null);
  assert.equal(toInitialTaskFormValues(project).dueDate, "");
});

test("apartment task options recommend its engineer and resolve urgent recipient beyond the first user page", () => {
  const apartment = {
    ...project,
    parentProjectId: "building-1",
    members: [{ id: "member-1", role: USER_ROLES.ENGINEER, userId: engineer.id, user: engineer }],
  };
  const options = toProjectTaskAssigneeOptions([], apartment);
  assert.equal(options[0].id, engineer.id);
  assert.match(options[0].label, /עובד ההנדסה של הדירה/);
  assert.equal(findTaskAssignee([], apartment, engineer.id)?.id, engineer.id);
});

test("inactive apartment engineers are not selectable as task assignees", () => {
  const inactive = { ...engineer, deletedAt: "2026-11-01T00:00:00.000Z" };
  const apartment = {
    ...project,
    parentProjectId: "building-1",
    members: [{ id: "member-1", role: USER_ROLES.ENGINEER, userId: inactive.id, user: inactive }],
  };
  assert.deepEqual(
    toProjectTaskAssigneeOptions([], apartment).map(option => option.id),
    [POOL_ASSIGNEE_ID],
  );
});

test("undated tasks show an explicit label and never become overdue", () => {
  const task = createTask();
  assert.equal(isTaskOverdue(task), false);
  assert.equal(formatTaskDueShort(task), "ללא תאריך יעד");
  assert.equal(formatTaskDueLabel(task), "ללא תאריך יעד");
  assert.equal(formatTaskDueFull(task), "ללא תאריך יעד");
  assert.equal(toDateInputValue(null), "");
  assert.equal(toDateInputValue("2026-10-30T12:00:00.000Z"), "2026-10-30");
});

test("response guard accepts all three persisted types and rejects missing or invalid types", () => {
  Object.values(TASK_TYPES).forEach(taskType => {
    assert.equal(isApiTask(createTask({ taskType })), true);
  });
  const missingType = { ...createTask() };
  Reflect.deleteProperty(missingType, "taskType");
  assert.equal(isApiTask(missingType), false);
  assert.equal(isApiTask({ ...createTask(), taskType: "unknown" }), false);
  assert.equal(isApiTask({ ...createTask(), taskType: null }), false);
  assert.equal(isApiTask({ ...createTask(), dueDate: 12 }), false);
});

test("legacy customer-only tasks remain readable with their existing association", () => {
  const customer = { id: "customer-legacy", name: "לקוח היסטורי" };
  const legacy = createTask({ projectId: null, project: null, customerId: customer.id, customer });
  assert.equal(isApiTask(legacy), true);
  assert.equal(getTaskLinkKind(legacy), TASK_LINK_KINDS.CUSTOMER);
  assert.equal(getTaskLinkName(legacy), customer.name);
  assert.deepEqual(getTaskCustomer(legacy), customer);
  assert.equal(buildTaskLinkPath(legacy), "/customers/customer-legacy");
});

test("legacy dual-link tasks continue resolving the customer through the project", () => {
  const currentCustomer = { id: "customer-current", name: "לקוח הפרויקט" };
  const legacy = createTask({
    customerId: "customer-stale",
    customer: { id: "customer-stale", name: "ישן" },
    project: {
      ...createTask().project,
      id: project.id,
      code: project.code,
      name: project.name,
      customer: currentCustomer,
    },
  });
  assert.deepEqual(getTaskCustomer(legacy), currentCustomer);
  assert.equal(getTaskLinkKind(legacy), TASK_LINK_KINDS.PROJECT);
  assert.equal(buildTaskLinkPath(legacy), "/projects/project-1");
});

test("task history displays recorded role snapshots and omits unknown legacy roles", () => {
  const author = {
    id: "user-1",
    email: "rina@example.com",
    phone: "0524418230",
    firstName: "Rina",
    lastName: "Example",
    employeeNumber: "104",
    deletedAt: null,
    role: USER_ROLES.FINANCE,
    assignedRoles: [USER_ROLES.FINANCE],
  };
  const transition = {
    id: "transition-1",
    taskId: "task-1",
    changedById: author.id,
    changedByRole: USER_ROLES.ENGINEER,
    changedBy: author,
    fromStatus: TASK_STATUSES.NOT_STARTED,
    toStatus: TASK_STATUSES.IN_PROGRESS,
    createdAt: "2026-10-14T10:00:00.000Z",
  };

  assert.equal(formatTransitionAuthor(transition), "Rina Example (עובד הנדסה)");
  assert.equal(formatTransitionAuthor({ ...transition, changedBy: null }), "—");
  assert.equal(formatTransitionAuthor({ ...transition, changedByRole: null }), "Rina Example");
  assert.equal(isApiTaskTransition({ ...transition, changedByRole: null }), true);
  assert.equal(isApiTaskTransition({ ...transition, changedByRole: "unknown-role" }), false);
  const missingSnapshot = { ...transition };
  Reflect.deleteProperty(missingSnapshot, "changedByRole");
  assert.equal(isApiTaskTransition(missingSnapshot), false);
});
