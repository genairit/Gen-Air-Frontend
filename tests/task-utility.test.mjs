import ts from "typescript";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && context.parentURL) {
      for (const suffix of [".ts", "/index.ts"]) {
        const url = new URL(specifier + suffix, context.parentURL);
        if (existsSync(url)) return { url: url.href, shortCircuit: true };
      }
    }
    const isDeepPackageImport = !specifier.startsWith(".") && /^[^@][^/]*\/.+[^.]{4}$/.test(specifier);

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
const { EMPTY_TASK_FORM, POOL_ASSIGNEE_ID } = await import("../src/constants/task.constant.ts");

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
  projectId: "p",
  customerId: "c",
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

test("an unassigned task reads as the open pool and only employees may claim it", () => {
  assert.equal(utility.formatAssigneeLabel(task()), "מאגר פתוח");
  assert.equal(utility.canClaimTask(task(), false), true);
  assert.equal(utility.canClaimTask(task(), true), false);
  assert.equal(utility.canClaimTask(task({ assigneeId: "u" }), false), false);
  assert.equal(utility.formatTaskContext(task()), "וילה · עמותת אור");
});

test("tabs map to status and urgency filters", () => {
  assert.deepEqual(utility.toTaskQuery("urgent", "x"), { search: "x", isUrgent: true, status: null });
  assert.deepEqual(utility.toTaskQuery("in_review", ""), { search: "", isUrgent: null, status: "in_review" });
  assert.deepEqual(utility.toTaskQuery("all", ""), { search: "", isUrgent: null, status: null });
});

test("the new-task form requires every field and a due date from today on", () => {
  assert.deepEqual(utility.getTaskFormErrors(filledForm), {});
  assert.deepEqual(Object.keys(utility.getTaskFormErrors(EMPTY_TASK_FORM)).sort(), [
    "assigneeOptionId",
    "customerId",
    "description",
    "dueDate",
    "projectId",
    "title",
  ]);
  assert.equal(
    utility.getTaskFormErrors({ ...filledForm, dueDate: day(-1) }).dueDate,
    "תאריך היעד לא יכול להיות בעבר",
  );
});

test("the open pool sends no assignee and picking a project pre-fills its customer", () => {
  assert.equal(utility.toCreateTaskPayload(filledForm).assigneeId, null);
  assert.equal(utility.toCreateTaskPayload({ ...filledForm, assigneeOptionId: "u-1" }).assigneeId, "u-1");
  assert.deepEqual(utility.toProjectSelection({ id: "p", customerId: "c" }), {
    projectId: "p",
    customerId: "c",
    isCustomerFromProject: true,
  });
  assert.deepEqual(utility.toProjectSelection(null), { projectId: null, isCustomerFromProject: false });
});
