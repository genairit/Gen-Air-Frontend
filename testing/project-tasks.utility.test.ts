import {
  isTaskOverdue,
  getTaskLinkKind,
  getTaskLinkName,
  getTaskCustomer,
  toDateInputValue,
  buildTaskLinkPath,
  formatTaskDueFull,
  getTaskFormErrors,
  formatTaskDueShort,
  formatTaskDueLabel,
  toCreateTaskPayload,
  countTaskFormErrors,
  toInitialTaskFormValues,
} from "../src/utilities/task.utility";

import moment from "moment";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createTask, project } from "./project-tasks.fixture";
import { DATE_FORMAT } from "../src/constants/date.constants";
import { isApiTask } from "../src/utilities/guards/task.guard";
import { TASK_TYPES } from "../src/constants/task-type.constant";
import type { ITaskFormValues } from "../src/interfaces/task.interface";
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
