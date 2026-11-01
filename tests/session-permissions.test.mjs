import ts from "typescript";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { test, beforeEach, after } from "node:test";

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && context.parentURL) {
      for (const suffix of [".ts", "/index.ts"]) {
        const url = new URL(specifier + suffix, context.parentURL);
        if (existsSync(url)) {
          return { url: url.href, shortCircuit: true };
        }
      }
    }

    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".ts")) {
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(
          readFileSync(fileURLToPath(url), "utf8").replaceAll("import.meta.env", "({})"),
          { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
        ).outputText,
      };
    }

    return next(url, context);
  },
});

const localItems = new Map();
const sessionItems = new Map();
const createStorage = items => ({
  getItem: key => items.get(key) ?? null,
  setItem: (key, value) => items.set(key, value),
  removeItem: key => items.delete(key),
});

globalThis.localStorage = createStorage(localItems);
globalThis.sessionStorage = createStorage(sessionItems);

const { isAuthorizedUser, isLoginResponse } = await import("../src/utilities/guards/api.guard.ts");
const { isPermission } = await import("../src/utilities/guards/permission.guard.ts");
const { readStoredSession, persistSession, clearStoredSession } =
  await import("../src/utilities/session.utility.ts");
const { loginAction } = await import("../src/actions/session.action.ts");
const { authService } = await import("../src/services/auth.service.ts");
const { getSession, setSession } = await import("../src/store/session.store.ts");
const { queryClient } = await import("../src/providers/query-client.ts");
const { applySessionUserAction } = await import("../src/actions/session-permissions.action.ts");
const { SESSION_USER_QUERY_KEY } = await import("../src/constants/permission.constant.ts");
const { LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } =
  await import("../src/constants/storage.constant.ts");

const identity = {
  id: "permission-user-1",
  email: "permission-user@example.invalid",
  phone: "0500000000",
  firstName: "Test",
  lastName: "User",
  role: "system_admin",
  employeeNumber: "EMP-1",
  deletedAt: null,
};
const authorized = permissions => ({ ...identity, permissions });
const session = user => ({ accessToken: "synthetic-session-token", user });

beforeEach(() => {
  localItems.clear();
  sessionItems.clear();
  queryClient.clear();
  setSession(null);
});
after(() => queryClient.clear());

test("login accepts only known permission arrays, including an explicitly empty grant set", () => {
  assert.equal(isAuthorizedUser(authorized(["projects.read", "tasks.create"])), true);
  assert.equal(isAuthorizedUser(authorized([])), true);
  assert.equal(isAuthorizedUser(identity), false);
  assert.equal(isAuthorizedUser(authorized(["unregistered.permission"])), false);
  assert.equal(isAuthorizedUser(authorized(["projects.read", 3])), false);
  assert.equal(isAuthorizedUser(authorized(null)), false);
  assert.equal(isAuthorizedUser(null), false);
  assert.equal(isLoginResponse(session(authorized(["projects.read"]))), true);
  assert.equal(isLoginResponse(session(identity)), false);
  assert.equal(isPermission("projects.read"), true);
  assert.equal(isPermission("unregistered.permission"), false);
});

test("legacy saved credentials restore with no grants until the server verifies the account", () => {
  localItems.set(LOCAL_STORAGE_KEYS.SESSION, JSON.stringify(session(identity)));

  assert.deepEqual(readStoredSession(), session(authorized([])));
});

test("malformed stored grants are rejected instead of being upgraded to an authorized session", () => {
  for (const permissions of [null, "projects.read", ["unknown"], [1]]) {
    localItems.set(LOCAL_STORAGE_KEYS.SESSION, JSON.stringify(session(authorized(permissions))));
    assert.equal(readStoredSession(), null);
  }
  localItems.set(LOCAL_STORAGE_KEYS.SESSION, "invalid json");
  assert.equal(readStoredSession(), null);
});

test("invalid credential records cannot restore a session", () => {
  for (const stored of [
    null,
    [],
    { user: identity },
    { accessToken: 7, user: identity },
    session({ id: "incomplete" }),
  ]) {
    localItems.set(LOCAL_STORAGE_KEYS.SESSION, JSON.stringify(stored));
    assert.equal(readStoredSession(), null);
  }
  clearStoredSession();
  assert.equal(readStoredSession(), null);
});

test("stored sessions preserve valid grants and the selected remember-me medium", () => {
  const current = session(authorized(["projects.read"]));

  persistSession(current, true);
  assert.deepEqual(readStoredSession(), current);
  assert.equal(sessionItems.size, 0);
  clearStoredSession();
  persistSession(current, false);
  assert.deepEqual(readStoredSession(), current);
  assert.equal(localItems.size, 0);
  assert.equal(sessionItems.has(SESSION_STORAGE_KEYS.SESSION), true);
});

test("late permission responses cannot replace another account or session token", () => {
  const current = session(authorized(["projects.read"]));
  setSession(current);
  queryClient.setQueryData(["projects"], ["existing"]);

  applySessionUserAction("expired-synthetic-token", authorized(["tasks.create"]));
  applySessionUserAction(current.accessToken, {
    ...authorized(["tasks.create"]),
    id: "other-user",
  });

  assert.deepEqual(getSession(), current);
  assert.deepEqual(queryClient.getQueryData(["projects"]), ["existing"]);
  assert.equal(localItems.size + sessionItems.size, 0);
});

test("a permission response after logout cannot restore an account", () => {
  applySessionUserAction("synthetic-session-token", authorized(["projects.read"]));

  assert.equal(getSession(), null);
  assert.equal(localItems.size + sessionItems.size, 0);
});

test("grant revocation clears domain caches but preserves current-user verification data", () => {
  const current = session(authorized(["projects.read", "tasks.create"]));
  const updatedUser = authorized(["projects.read"]);
  const currentUserKey = [...SESSION_USER_QUERY_KEY, identity.id];
  setSession(current);
  persistSession(current, true);
  queryClient.setQueryData(["projects"], ["restricted-data"]);
  queryClient.setQueryData(["task-counts"], { total: 10 });
  queryClient.setQueryData(currentUserKey, updatedUser);

  applySessionUserAction(current.accessToken, updatedUser);

  assert.deepEqual(getSession(), session(updatedUser));
  assert.deepEqual(readStoredSession(), session(updatedUser));
  assert.equal(queryClient.getQueryData(["projects"]) == null, true);
  assert.equal(queryClient.getQueryData(["task-counts"]) == null, true);
  assert.deepEqual(queryClient.getQueryData(currentUserKey), updatedUser);
  assert.equal(sessionItems.size, 0);
});

test("a new grant refreshes a non-remembered session without persisting it to local storage", () => {
  const current = session(authorized([]));
  const updatedUser = authorized(["customers.create"]);
  setSession(current);
  persistSession(current, false);

  applySessionUserAction(current.accessToken, updatedUser);

  assert.deepEqual(getSession(), session(updatedUser));
  assert.deepEqual(readStoredSession(), session(updatedUser));
  assert.equal(localItems.size, 0);
  assert.equal(sessionItems.has(SESSION_STORAGE_KEYS.SESSION), true);
});

test("unchanged verification does not erase valid query data or rewrite storage", () => {
  const current = session(authorized(["projects.read"]));
  setSession(current);
  queryClient.setQueryData(["projects"], ["visible-data"]);

  applySessionUserAction(current.accessToken, current.user);

  assert.equal(getSession(), current);
  assert.deepEqual(queryClient.getQueryData(["projects"]), ["visible-data"]);
  assert.equal(localItems.size + sessionItems.size, 0);
});

test("successful re-login clears an older same-account verification and domain cache", async () => {
  const oldSession = session(authorized(["projects.read", "tasks.create"]));
  const newSession = {
    accessToken: "new-synthetic-session-token",
    user: authorized(["projects.read"]),
  };
  const currentUserKey = [...SESSION_USER_QUERY_KEY, identity.id];
  const originalLogin = authService.login;
  setSession(oldSession);
  persistSession(oldSession, true);
  queryClient.setQueryData(currentUserKey, oldSession.user);
  queryClient.setQueryData(["projects"], ["old-session-data"]);
  authService.login = async () => newSession;

  try {
    await loginAction({
      email: identity.email,
      password: "synthetic-password",
      isRemembered: false,
    });

    assert.deepEqual(getSession(), newSession);
    assert.deepEqual(readStoredSession(), newSession);
    assert.equal(queryClient.getQueryData(currentUserKey) == null, true);
    assert.equal(queryClient.getQueryData(["projects"]) == null, true);
    assert.equal(localItems.size, 0);
    assert.equal(sessionItems.has(SESSION_STORAGE_KEYS.SESSION), true);
  } finally {
    authService.login = originalLogin;
  }
});

test("failed login preserves the current session and its valid caches", async () => {
  const current = session(authorized(["projects.read"]));
  const originalLogin = authService.login;
  const error = new Error("Login denied");
  setSession(current);
  persistSession(current, true);
  queryClient.setQueryData(["projects"], ["visible-data"]);
  authService.login = async () => {
    throw error;
  };

  try {
    await assert.rejects(
      loginAction({
        email: identity.email,
        password: "invalid-synthetic-password",
        isRemembered: false,
      }),
      caught => caught === error,
    );

    assert.deepEqual(getSession(), current);
    assert.deepEqual(readStoredSession(), current);
    assert.deepEqual(queryClient.getQueryData(["projects"]), ["visible-data"]);
  } finally {
    authService.login = originalLogin;
  }
});
