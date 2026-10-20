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
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".ts"))
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
        }).outputText,
      };
    return next(url, context);
  },
});

const roles = await import("../src/constants/user-role.constant.ts");
const { hasPermission } = await import("../src/utilities/permission.utility.ts");
const { EMPLOYEE_FILTERS } = await import("../src/constants/employee.constant.ts");

const { USER_ROLES, USER_ROLE_VALUES, USER_ROLE_LABELS, PROJECT_MEMBER_ROLES } = roles;
const userWithRole = role => ({ id: role, role });
const rolesAllowed = permission =>
  USER_ROLE_VALUES.filter(role => hasPermission(userWithRole(role), permission));

test("exactly the six app roles exist, each with its spec label", () => {
  assert.deepEqual(USER_ROLE_LABELS, {
    system_admin: "הנהלה / מנהל מערכת",
    engineer: "עובד הנדסה",
    secretary: "מזכירה",
    project_manager: "מנהל פרויקט",
    finance: "מחלקת כספים",
    installer: "מתקין",
  });
  assert.equal(USER_ROLE_VALUES.length, 6);
  assert.deepEqual(new Set(USER_ROLE_VALUES), new Set(Object.values(USER_ROLES)));
});

test("projects are staffed only by engineer, secretary, project manager and installer", () => {
  assert.deepEqual(PROJECT_MEMBER_ROLES, [
    USER_ROLES.ENGINEER,
    USER_ROLES.SECRETARY,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.INSTALLER,
  ]);
});

test("management alone creates projects, customers and tasks", () => {
  for (const permission of [
    "CREATE_PROJECTS",
    "MANAGE_CUSTOMERS",
    "MANAGE_TASKS",
    "DELETE_PROJECTS",
  ]) {
    assert.deepEqual(rolesAllowed(permission), [USER_ROLES.SYSTEM_ADMIN], permission);
  }
});

test("engineers claim tasks and update task status alongside management", () => {
  assert.deepEqual(rolesAllowed("CLAIM_TASKS"), [USER_ROLES.ENGINEER]);
  assert.deepEqual(rolesAllowed("UPDATE_TASK_STATUS"), [
    USER_ROLES.SYSTEM_ADMIN,
    USER_ROLES.ENGINEER,
  ]);
});

test("only management, secretary and project manager move project status", () => {
  assert.deepEqual(rolesAllowed("MOVE_PROJECT_STAGE"), [
    USER_ROLES.SYSTEM_ADMIN,
    USER_ROLES.SECRETARY,
    USER_ROLES.PROJECT_MANAGER,
  ]);
  assert.equal(hasPermission(null, "MOVE_PROJECT_STAGE"), false);
});

test("the employees page filters by every app role", () => {
  assert.deepEqual(
    EMPLOYEE_FILTERS.map(filter => filter.role),
    [null, ...USER_ROLE_VALUES],
  );
});

test("project form modes require the create or edit project permission", async () => {
  const { PROJECT_FORM_MODE_PERMISSIONS } =
    await import("../src/constants/project-form.constant.ts");
  const rolesAllowedFor = mode => rolesAllowed(PROJECT_FORM_MODE_PERMISSIONS[mode]);

  assert.deepEqual(PROJECT_FORM_MODE_PERMISSIONS, {
    new: "CREATE_PROJECTS",
    edit: "EDIT_PROJECTS",
  });
  assert.deepEqual(rolesAllowedFor("new"), [USER_ROLES.SYSTEM_ADMIN]);
  assert.deepEqual(rolesAllowedFor("edit"), [
    USER_ROLES.SYSTEM_ADMIN,
    USER_ROLES.SECRETARY,
    USER_ROLES.PROJECT_MANAGER,
  ]);
});
