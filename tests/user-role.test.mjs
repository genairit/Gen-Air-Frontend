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

test("feature grants come from the server rather than the role name", () => {
  const permission = "projects.create";

  for (const role of USER_ROLE_VALUES) {
    assert.equal(hasPermission({ role, permissions: [permission] }, permission), true);
    assert.equal(hasPermission({ role, permissions: [] }, permission), false);
    assert.equal(hasPermission({ role }, permission), false);
  }
});

test("a grant permits only its specific feature action", () => {
  const user = { role: USER_ROLES.SYSTEM_ADMIN, permissions: ["tasks.create"] };

  assert.equal(hasPermission(user, "tasks.create"), true);
  assert.equal(hasPermission(user, "tasks.assign"), false);
  assert.equal(hasPermission(user, "tasks.urgency.change"), false);
  assert.equal(hasPermission(null, "tasks.create"), false);
});

test("the employees page filters by every app role", () => {
  assert.deepEqual(
    EMPLOYEE_FILTERS.map(filter => filter.role),
    [null, ...USER_ROLE_VALUES],
  );
});

test("project form modes require their independent create or update grant", async () => {
  const { PROJECT_FORM_MODE_PERMISSIONS } =
    await import("../src/constants/project-form.constant.ts");

  assert.deepEqual(PROJECT_FORM_MODE_PERMISSIONS, {
    new: "projects.create",
    edit: "projects.update",
  });
  const creator = { role: USER_ROLES.SECRETARY, permissions: ["projects.create"] };
  const editor = { role: USER_ROLES.SYSTEM_ADMIN, permissions: ["projects.update"] };

  assert.equal(hasPermission(creator, PROJECT_FORM_MODE_PERMISSIONS.new), true);
  assert.equal(hasPermission(creator, PROJECT_FORM_MODE_PERMISSIONS.edit), false);
  assert.equal(hasPermission(editor, PROJECT_FORM_MODE_PERMISSIONS.new), false);
  assert.equal(hasPermission(editor, PROJECT_FORM_MODE_PERMISSIONS.edit), true);
});
