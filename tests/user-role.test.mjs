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
const { canSubmitEmployeeForm, toUserPayload } =
  await import("../src/utilities/employee.utility.ts");
const { getApartmentTeamCandidates } = await import("../src/utilities/apartment.utility.ts");
const { isApiUser } = await import("../src/utilities/guards/api.guard.ts");
const { getAssignedRoles, getUsersAssignedToRole } =
  await import("../src/utilities/user-role.utility.ts");
const { countUsersForFilter } = await import("../src/utilities/employee.utility.ts");
const { isUserRoleCounts } = await import("../src/utilities/guards/api.guard.ts");

const employeeForm = overrides => ({
  name: "Rina Example",
  email: "rina@example.com",
  phone: "0524418230",
  password: "passphrase-123",
  passwordConfirmation: "passphrase-123",
  assignedRoles: [USER_ROLES.ENGINEER, USER_ROLES.SECRETARY],
  ...overrides,
});

const apiUser = overrides => ({
  id: "employee-1",
  email: "rina@example.com",
  phone: "0501234567",
  firstName: "Rina",
  lastName: "Example",
  role: USER_ROLES.FINANCE,
  assignedRoles: [USER_ROLES.FINANCE, USER_ROLES.ENGINEER],
  employeeNumber: "104",
  deletedAt: null,
  ...overrides,
});

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

test("legacy users default to their active role while multi-role membership is retained", () => {
  const legacyUser = apiUser();
  Reflect.deleteProperty(legacyUser, "assignedRoles");

  assert.deepEqual(getAssignedRoles(legacyUser), [USER_ROLES.FINANCE]);
  assert.deepEqual(getAssignedRoles(apiUser()), [USER_ROLES.FINANCE, USER_ROLES.ENGINEER]);
  assert.equal(isApiUser(apiUser()), true);
  assert.equal(
    isApiUser(
      apiUser({ assignedRoles: [USER_ROLES.FINANCE, USER_ROLES.ENGINEER, USER_ROLES.ENGINEER] }),
    ),
    false,
  );
  assert.equal(isApiUser(apiUser({ assignedRoles: [USER_ROLES.ENGINEER] })), false);
});

test("employee forms require assigned roles and leave initial active-role choice to the server", () => {
  assert.equal(canSubmitEmployeeForm(employeeForm()), true);
  assert.equal(
    canSubmitEmployeeForm(employeeForm({ assignedRoles: [USER_ROLES.SECRETARY] })),
    true,
  );
  assert.equal(canSubmitEmployeeForm(employeeForm({ assignedRoles: [] })), false);
  assert.equal(
    canSubmitEmployeeForm(employeeForm({ passwordConfirmation: "other-password" })),
    false,
  );
  assert.deepEqual(toUserPayload(employeeForm()), {
    firstName: "Rina",
    lastName: "Example",
    assignedRoles: [USER_ROLES.ENGINEER, USER_ROLES.SECRETARY],
    password: "passphrase-123",
    email: "rina@example.com",
    phone: "0524418230",
  });
});

test("project team eligibility uses assigned roles rather than the active role", () => {
  const candidates = getApartmentTeamCandidates([apiUser()], []);

  assert.deepEqual(
    candidates.map(candidate => ({ userId: candidate.user.id, role: candidate.role })),
    [{ userId: "employee-1", role: USER_ROLES.ENGINEER }],
  );
});

test("project role pickers include employees by assigned membership", () => {
  assert.deepEqual(
    getUsersAssignedToRole([apiUser()], USER_ROLES.ENGINEER).map(user => user.id),
    ["employee-1"],
  );
});

test("All counts distinct employee accounts rather than overlapping assigned-role memberships", () => {
  const counts = {
    ...Object.fromEntries(USER_ROLE_VALUES.map(role => [role, 0])),
    [USER_ROLES.ENGINEER]: 2,
    [USER_ROLES.SECRETARY]: 1,
    total: 2,
  };

  assert.equal(isUserRoleCounts(counts), true);
  assert.equal(countUsersForFilter(counts, EMPLOYEE_FILTERS[0]), 2);
  const engineerFilter = EMPLOYEE_FILTERS.find(filter => filter.role === USER_ROLES.ENGINEER);
  assert.ok(engineerFilter);
  assert.equal(countUsersForFilter(counts, engineerFilter), 2);
  assert.equal(countUsersForFilter(null, EMPLOYEE_FILTERS[0]), 0);
  const missingTotal = { ...counts };
  Reflect.deleteProperty(missingTotal, "total");
  assert.equal(isUserRoleCounts(missingTotal), false);
});
