import ts from "typescript";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && context.parentURL) {
      for (const suffix of [".ts", "/index.ts", ".js"]) {
        const url = new URL(specifier + suffix, context.parentURL);
        if (existsSync(url)) return { url: url.href, shortCircuit: true };
      }
    }
    const isDeepPackageImport =
      !specifier.startsWith(".") && /^[^@][^/]*\/.+[^.]{4}$/.test(specifier);

    if (isDeepPackageImport) {
      try {
        return next(specifier, context);
      } catch {
        return next(`${specifier}.js`, context);
      }
    }

    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".ts"))
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(
          readFileSync(fileURLToPath(url), "utf8").replaceAll("import.meta.env", "({})"),
          {
            compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
          },
        ).outputText,
      };
    return next(url, context);
  },
});

const moment = (await import("moment")).default;
const utility = await import("../src/utilities/task.utility.ts");
const { EMPTY_TASK_FORM, POOL_ASSIGNEE_ID, TASK_ASSIGNEES_QUERY } =
  await import("../src/constants/task.constant.ts");

const day = offset => moment().add(offset, "day").format("YYYY-MM-DD");

const task = overrides => ({
  id: "task-1",
  title: "Task",
  status: "not_started",
  isUrgent: false,
  dueDate: day(3),
  assignee: null,
  assigneeId: null,
  createdBy: null,
  urgencyMarkedBy: null,
  urgencyMarkedAt: null,
  createdAt: "2026-10-14T10:00:00.000Z",
  project: { id: "p", code: "GA-1", name: "וילה" },
  customer: { id: "c", name: "עמותת אור" },
  ...overrides,
});

const filledForm = {
  ...EMPTY_TASK_FORM,
  linkKind: "project",
  projectId: "p",
  title: "בדיקה",
  dueDate: day(1),
  description: "תיאור",
  assigneeOptionId: POOL_ASSIGNEE_ID,
};

test("a task is overdue only after its due day has passed", () => {
  assert.equal(utility.isTaskOverdue(task({ dueDate: day(-1) })), true);
  assert.equal(utility.isTaskOverdue(task({ dueDate: day(0) })), false);
  assert.equal(utility.isTaskOverdue(task({ dueDate: null })), false);
  assert.match(utility.formatTaskDueShort(task({ dueDate: day(-1) })), /^באיחור · /);
  assert.match(utility.formatTaskDueLabel(task({ dueDate: day(2) })), /^עד /);
});

test("an unassigned task reads as the open pool and only claim-permitted users may claim it", () => {
  assert.equal(utility.formatAssigneeLabel(task()), "מאגר פתוח");
  assert.equal(utility.canClaimTask(task(), true), true);
  assert.equal(utility.canClaimTask(task(), false), false);
  assert.equal(utility.canClaimTask(task({ assigneeId: "u" }), true), false);
});

test("a task reads as linked to its project, with the project customer as context", () => {
  const projectTask = task({
    projectId: "p",
    customerId: null,
    customer: null,
    project: { id: "p", code: "GA-1", name: "וילה", customer: { id: "c", name: "עמותת אור" } },
  });
  assert.equal(utility.getTaskLinkKind(projectTask), "project");
  assert.equal(utility.getTaskLinkName(projectTask), "וילה");
  assert.equal(utility.formatTaskLinkContext(projectTask), "· עמותת אור");
  assert.equal(utility.formatTaskLinkedToLabel(projectTask), "משויכת לפרויקט");
  assert.deepEqual(utility.getTaskProjectCustomer(projectTask), { id: "c", name: "עמותת אור" });
  assert.equal(utility.buildTaskLinkPath(projectTask), "/projects/p");
});

test("a customer task reads as linked to the customer with no project context", () => {
  const customerTask = task({ projectId: null, customerId: "c", project: null });
  assert.equal(utility.getTaskLinkKind(customerTask), "customer");
  assert.equal(utility.getTaskLinkName(customerTask), "עמותת אור");
  assert.equal(utility.formatTaskLinkContext(customerTask), "");
  assert.equal(utility.getTaskProjectCustomer(customerTask), null);
  assert.equal(utility.buildTaskLinkPath(customerTask), "/customers/c");
});

test("a legacy task with both links stays a project task and falls back to its stored customer", () => {
  const legacyTask = task({ projectId: "p", customerId: "c" });
  assert.equal(utility.getTaskLinkKind(legacyTask), "project");
  assert.equal(utility.formatTaskLinkContext(legacyTask), "· עמותת אור");
});

test("a legacy apartment task shows its building's customer, not its stored customer", () => {
  const legacyApartmentTask = task({
    projectId: "a",
    customerId: "c",
    project: {
      id: "a",
      code: "GA-2",
      name: "דירה 4",
      customer: null,
      parentProject: { id: "b", code: "GA-1", name: "בניין", customer: { id: "o", name: "בעלים" } },
    },
  });
  assert.deepEqual(utility.getTaskProjectCustomer(legacyApartmentTask), { id: "o", name: "בעלים" });
  assert.equal(utility.formatTaskLinkContext(legacyApartmentTask), "· בעלים");
});

test("tabs map to status and urgency filters", () => {
  assert.deepEqual(utility.toTaskQuery("urgent", "x"), {
    search: "x",
    isUrgent: true,
    status: null,
  });
  assert.deepEqual(utility.toTaskQuery("in_review", ""), {
    search: "",
    isUrgent: null,
    status: "in_review",
  });
  assert.deepEqual(utility.toTaskQuery("all", ""), { search: "", isUrgent: null, status: null });
});

test("the new-task form requires every field and a due date from today on", () => {
  assert.deepEqual(utility.getTaskFormErrors(filledForm), {});
  assert.deepEqual(Object.keys(utility.getTaskFormErrors(EMPTY_TASK_FORM)).sort(), [
    "assigneeOptionId",
    "description",
    "dueDate",
    "linkKind",
    "title",
  ]);
  assert.deepEqual(utility.getTaskFormErrors({ ...filledForm, projectId: null }), {
    projectId: "בחר פרויקט",
  });
  assert.deepEqual(
    utility.getTaskFormErrors({ ...filledForm, linkKind: "customer", projectId: null }),
    {
      customerId: "בחר לקוח",
    },
  );
  assert.equal(
    utility.getTaskFormErrors({ ...filledForm, dueDate: day(-1) }).dueDate,
    "תאריך היעד לא יכול להיות בעבר",
  );
});

test("the open pool sends no assignee and only the chosen link is sent", () => {
  assert.equal(utility.toCreateTaskPayload(filledForm).assigneeId, null);
  assert.equal(
    utility.toCreateTaskPayload({ ...filledForm, assigneeOptionId: "u-1" }).assigneeId,
    "u-1",
  );
  const projectPayload = utility.toCreateTaskPayload(filledForm);
  assert.equal(projectPayload.projectId, "p");
  assert.equal("customerId" in projectPayload, false);
  const customerPayload = utility.toCreateTaskPayload({
    ...filledForm,
    ...utility.toTaskLinkSelection("customer", "c"),
  });
  assert.equal(customerPayload.customerId, "c");
  assert.equal("projectId" in customerPayload, false);
  assert.equal(utility.toCreateTaskPayload({ ...filledForm, linkKind: null }), null);
});

test("switching the link kind clears the earlier selection and remembers it for undo", () => {
  const switched = { ...filledForm, ...utility.toLinkKindChange("customer") };
  assert.equal(switched.linkKind, "customer");
  assert.equal(switched.projectId, null);
  assert.equal(switched.customerId, null);
  assert.equal(utility.toCreateTaskPayload(switched), null);
  assert.equal(utility.hasTaskLinkSelection(filledForm), true);
  assert.equal(utility.hasTaskLinkSelection(switched), false);
  assert.deepEqual(utility.toTaskFormLink(filledForm), {
    linkKind: "project",
    projectId: "p",
    customerId: null,
  });
  assert.equal(
    utility.formatClearedLinkNotice(utility.toTaskFormLink(filledForm), "וילה"),
    "השיוך הקודם (פרויקט: וילה) נוקה",
  );
});

test("opening the form from a project preselects that project link", () => {
  const values = utility.toInitialTaskFormValues({ id: "p", name: "וילה" });
  assert.equal(values.linkKind, "project");
  assert.equal(values.projectId, "p");
  assert.equal(values.customerId, null);
  assert.deepEqual(utility.toInitialTaskFormValues(null), EMPTY_TASK_FORM);
});

const transition = overrides => ({
  id: "t",
  taskId: "task-1",
  toStatus: "in_progress",
  fromStatus: "not_started",
  changedById: "u",
  changedBy: null,
  createdAt: "2026-10-14T10:00:00.000Z",
  ...overrides,
});

test("the status history counts updates and knows when it is partial", () => {
  const created = transition({ id: "c", fromStatus: null, toStatus: "not_started" });
  assert.equal(utility.formatHistoryCount(1), "1 עדכון");
  assert.equal(utility.formatHistoryCount(6), "6 עדכונים");
  assert.equal(utility.isHistoryPartial([]), false);
  assert.equal(utility.isHistoryPartial([transition()]), true);
  assert.equal(utility.isHistoryPartial([transition(), created]), false);
});

test("a long status history shows the newest four until expanded", () => {
  const history = Array.from({ length: 6 }, (_, index) => transition({ id: `t${index}` }));
  assert.deepEqual(
    utility.getVisibleHistory(history, false).map(entry => entry.id),
    ["t0", "t1", "t2", "t3"],
  );
  assert.equal(utility.getVisibleHistory(history, true).length, 6);
  assert.deepEqual(utility.getHistoryToggleCopy({ isExpanded: false, total: 6 }), {
    label: "הצג הכל (6)",
    caption: "עוד 2 עדכונים ישנים יותר",
  });
  assert.equal(utility.getHistoryToggleCopy({ isExpanded: true, total: 6 }).label, "הצג פחות");
});

test("task assignee pickers list engineers only", () => {
  assert.deepEqual(TASK_ASSIGNEES_QUERY, { search: "", role: "engineer" });
});

test("link options map projects and customers, and a missing option is null", () => {
  const projectOption = utility.toProjectLinkOption({
    id: "p",
    code: "GA-1",
    name: "וילה",
    projectType: { name: "מסחרי" },
  });
  assert.deepEqual(projectOption, { id: "p", name: "וילה", caption: "GA-1", tag: "מסחרי" });
  assert.equal(utility.toProjectLinkOption({ id: "p", code: "GA-1", name: "וילה" }).tag, null);

  const customer = {
    id: "c",
    name: "עמותת אור",
    taxId: "516001237",
    customerType: "company",
    prioritySyncStatus: "pending",
  };
  const customerOption = utility.toCustomerLinkOption(customer);
  assert.equal(customerOption.tag, null);
  assert.match(customerOption.caption, /516001237/);
  assert.equal(utility.toSelectedCustomerOption(customer).caption, customerOption.caption);
  assert.match(
    utility.toSelectedCustomerOption({ ...customer, prioritySyncStatus: "synced" }).caption,
    /516001237 · סונכרן ל-Priority$/,
  );

  assert.equal(utility.findLinkOption([projectOption], "p"), projectOption);
  assert.equal(utility.findLinkOption([projectOption], "missing"), null);
});

test("task link helpers fall back safely when a relation or id is missing", () => {
  const unlinked = task({ projectId: null, customerId: null, project: null, customer: null });
  assert.equal(utility.buildTaskLinkPath(unlinked), null);
  assert.equal(utility.getTaskLinkName(task({ projectId: "p", project: null })), "p");
  assert.equal(
    utility.getTaskLinkName(task({ projectId: null, customerId: "c", customer: null })),
    "c",
  );
  assert.deepEqual(
    utility.getTaskCustomer(
      task({
        customer: null,
        project: { id: "p", code: "GA-1", name: "וילה", customer: { id: "o", name: "בעלים" } },
      }),
    ),
    { id: "o", name: "בעלים" },
  );
  assert.equal(utility.getTaskCustomer(task({ customer: null, project: null })), null);
  const apartmentTask = task({
    projectId: "a",
    customerId: null,
    customer: null,
    project: {
      id: "a",
      code: "GA-2",
      name: "דירה 4",
      customer: null,
      parentProject: { id: "b", code: "GA-1", name: "בניין", customer: { id: "o", name: "בעלים" } },
    },
  });
  assert.deepEqual(utility.getTaskCustomer(apartmentTask), { id: "o", name: "בעלים" });
  assert.equal(utility.formatTaskLinkContext(apartmentTask), "· בעלים");
  assert.equal(
    utility.formatClearedLinkNotice({ linkKind: null, projectId: null, customerId: null }, "x"),
    "",
  );
});

test("a project's customer falls back to its building for apartments", () => {
  const owner = { id: "o", name: "בעלים" };
  assert.deepEqual(utility.getProjectCustomer({ customer: owner }), owner);
  assert.deepEqual(
    utility.getProjectCustomer({ customer: null, parentProject: { customer: owner } }),
    owner,
  );
  assert.equal(utility.getProjectCustomer({ customer: null, parentProject: null }), null);
  assert.equal(utility.getProjectCustomer(null), null);
});
