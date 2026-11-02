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
const { USER_ROLES } = await import("../src/constants/user-role.constant.ts");
const { TIME_UNITS } = await import("../src/constants/time.constant.ts");
const { PERMISSIONS } = await import("../src/constants/permission.constant.ts");
const { QUERY_KEYS } = await import("../src/constants/query-key.constant.ts");
const { TASK_STATUSES } = await import("../src/constants/task.constant.ts");
const { MutationObserver } = await import("@tanstack/react-query");
const { customerService } = await import("../src/services/customer.service.ts");
const { taskService } = await import("../src/services/task.service.ts");
const { createCustomerAction } = await import("../src/actions/customer.action.ts");
const { updateTaskStatusAction } = await import("../src/actions/task.action.ts");
const { AuthorizationContextChangedError } =
  await import("../src/managers/authorization-context.manager.ts");
const { getApiErrorMessage } = await import("../src/utilities/api-error.utility.ts");
const { QueryObserver, notifyManager } = await import("@tanstack/react-query");
const { switchActiveRoleAction } = await import("../src/actions/role-switch.action.ts");
const { refreshSessionUserAction } = await import("../src/actions/session-refresh.action.ts");
const { userService } = await import("../src/services/user.service.ts");
const { httpClient } = await import("../src/services/http-client.service.ts");
const { SessionBroadcastManager } = await import("../src/managers/session-broadcast.manager.ts");
const { logger } = await import("../src/utilities/logger.utility.ts");
const { clearSessionAction } = await import("../src/actions/session-reset.action.ts");
const { SessionRequestManager } = await import("../src/managers/session-request.manager.ts");
const { verifySessionUserAction } = await import("../src/actions/session-refresh.action.ts");
const { API_ENDPOINTS, HTTP_STATUS } = await import("../src/constants/api.constant.ts");

const identity = {
  id: "permission-user-1",
  email: "permission-user@example.invalid",
  phone: "0500000000",
  firstName: "Test",
  lastName: "User",
  role: USER_ROLES.SYSTEM_ADMIN,
  assignedRoles: [USER_ROLES.SYSTEM_ADMIN],
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
  const legacyIdentity = { ...identity };
  Reflect.deleteProperty(legacyIdentity, "assignedRoles");
  localItems.set(LOCAL_STORAGE_KEYS.SESSION, JSON.stringify(session(legacyIdentity)));

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

test("late permission responses cannot replace another account or session token", async () => {
  const current = session(authorized(["projects.read"]));
  setSession(current);
  queryClient.setQueryData(["projects"], ["existing"]);

  await applySessionUserAction("expired-synthetic-token", authorized(["tasks.create"]));
  await applySessionUserAction(current.accessToken, {
    ...authorized(["tasks.create"]),
    id: "other-user",
  });

  assert.deepEqual(getSession(), current);
  assert.deepEqual(queryClient.getQueryData(["projects"]), ["existing"]);
  assert.equal(localItems.size + sessionItems.size, 0);
});

test("a permission response after logout cannot restore an account", async () => {
  await applySessionUserAction("synthetic-session-token", authorized(["projects.read"]));

  assert.equal(getSession(), null);
  assert.equal(localItems.size + sessionItems.size, 0);
});

test("grant revocation clears domain caches but preserves current-user verification data", async () => {
  const current = session(authorized(["projects.read", "tasks.create"]));
  const updatedUser = authorized(["projects.read"]);
  const currentUserKey = [...SESSION_USER_QUERY_KEY, identity.id];
  setSession(current);
  persistSession(current, true);
  queryClient.setQueryData(["projects"], ["restricted-data"]);
  queryClient.setQueryData(["task-counts"], { total: 10 });
  queryClient.setQueryData(currentUserKey, updatedUser);

  await applySessionUserAction(current.accessToken, updatedUser);

  assert.deepEqual(getSession(), session(updatedUser));
  assert.deepEqual(readStoredSession(), session(updatedUser));
  assert.equal(queryClient.getQueryData(["projects"]) == null, true);
  assert.equal(queryClient.getQueryData(["task-counts"]) == null, true);
  assert.deepEqual(queryClient.getQueryData(currentUserKey), updatedUser);
  assert.equal(sessionItems.size, 0);
});

test("a new grant refreshes a non-remembered session without persisting it to local storage", async () => {
  const current = session(authorized([]));
  const updatedUser = authorized(["customers.create"]);
  setSession(current);
  persistSession(current, false);

  await applySessionUserAction(current.accessToken, updatedUser);

  assert.deepEqual(getSession(), session(updatedUser));
  assert.deepEqual(readStoredSession(), session(updatedUser));
  assert.equal(localItems.size, 0);
  assert.equal(sessionItems.has(SESSION_STORAGE_KEYS.SESSION), true);
});

test("unchanged verification does not erase valid query data or rewrite storage", async () => {
  const current = session(authorized(["projects.read"]));
  setSession(current);
  queryClient.setQueryData(["projects"], ["visible-data"]);

  await applySessionUserAction(current.accessToken, current.user);

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

const deferred = () => {
  const state = {};
  const promise = new Promise((resolve, reject) => Object.assign(state, { resolve, reject }));
  return { promise, resolve: value => state.resolve(value), reject: error => state.reject(error) };
};

const multiRoleUser = (role = USER_ROLES.SYSTEM_ADMIN, permissions = ["projects.read"]) => ({
  ...authorized(permissions),
  assignedRoles: [USER_ROLES.SYSTEM_ADMIN, USER_ROLES.INSTALLER],
  role,
});

test("a successful switch rejects an older refresh and updates remembered identity and grants", async () => {
  const originalGetMe = userService.getMe;
  const originalSwitch = authService.switchRole;
  const originalNotify = SessionBroadcastManager.notifyUserChanged;
  const response = deferred();
  const notifications = [];
  const updatedUser = multiRoleUser(USER_ROLES.INSTALLER, ["tasks.read"]);
  setSession(session(multiRoleUser()));
  persistSession(getSession(), true);
  userService.getMe = () => response.promise;
  authService.switchRole = async () => updatedUser;
  SessionBroadcastManager.notifyUserChanged = userId => notifications.push(userId);

  try {
    const refresh = refreshSessionUserAction(identity.id);
    await switchActiveRoleAction(USER_ROLES.INSTALLER);
    response.resolve(multiRoleUser());
    await refresh;

    assert.deepEqual(getSession(), session(updatedUser));
    assert.deepEqual(readStoredSession(), session(updatedUser));
    assert.deepEqual(notifications, [identity.id]);
  } finally {
    userService.getMe = originalGetMe;
    authService.switchRole = originalSwitch;
    SessionBroadcastManager.notifyUserChanged = originalNotify;
  }
});

test("a stale unauthorized refresh cannot log out a successfully switched session", async () => {
  const { AxiosError } = await import("axios");
  const originalGetMe = userService.getMe;
  const originalSwitch = authService.switchRole;
  const response = deferred();
  const updatedUser = multiRoleUser(USER_ROLES.INSTALLER, ["tasks.read"]);
  setSession(session(multiRoleUser()));
  userService.getMe = () => response.promise;
  authService.switchRole = async () => updatedUser;

  try {
    const refresh = refreshSessionUserAction(identity.id);
    await switchActiveRoleAction(USER_ROLES.INSTALLER);
    response.reject(new AxiosError("revoked old response", null, null, null, { status: 401 }));
    await refresh;
    assert.deepEqual(getSession(), session(updatedUser));
  } finally {
    userService.getMe = originalGetMe;
    authService.switchRole = originalSwitch;
  }
});

test("refreshes during a switch do not race the selected role; a failed switch preserves valid state", async () => {
  const originalGetMe = userService.getMe;
  const originalSwitch = authService.switchRole;
  const response = deferred();
  const current = session(multiRoleUser());
  const calls = [];
  setSession(current);
  persistSession(current, false);
  queryClient.setQueryData(["restricted"], ["still-authorized"]);
  userService.getMe = async () => {
    calls.push("refresh");
    return current.user;
  };
  authService.switchRole = () => response.promise;

  try {
    const switching = switchActiveRoleAction(USER_ROLES.INSTALLER);
    const refresh = refreshSessionUserAction(identity.id);
    assert.deepEqual(calls, []);
    response.reject(new Error("role was revoked"));
    await assert.rejects(switching, /role was revoked/);
    await refresh;
    assert.deepEqual(calls, ["refresh"]);
    assert.deepEqual(getSession(), current);
    assert.deepEqual(readStoredSession(), current);
    assert.deepEqual(queryClient.getQueryData(["restricted"]), ["still-authorized"]);
    await refreshSessionUserAction(identity.id);
    assert.deepEqual(calls, ["refresh", "refresh"]);
  } finally {
    userService.getMe = originalGetMe;
    authService.switchRole = originalSwitch;
  }
});

test("the newest refresh wins even when earlier responses arrive last", async () => {
  const originalGetMe = userService.getMe;
  const older = deferred();
  const newer = deferred();
  const responses = [older, newer];
  const updatedUser = multiRoleUser(USER_ROLES.INSTALLER, ["tasks.read"]);
  setSession(session(multiRoleUser()));
  userService.getMe = () => responses.shift().promise;

  try {
    const first = refreshSessionUserAction(identity.id);
    const second = refreshSessionUserAction(identity.id);
    newer.resolve(updatedUser);
    await second;
    older.resolve(multiRoleUser());
    await first;
    assert.deepEqual(getSession(), session(updatedUser));
  } finally {
    userService.getMe = originalGetMe;
  }
});

test("mounted observers clear old-role data, cancel old fetches, and refetch under the new role", async () => {
  const originalSwitch = authService.switchRole;
  const oldResponse = deferred();
  const newResponse = deferred();
  const results = [];
  const updatedUser = multiRoleUser(USER_ROLES.INSTALLER, ["tasks.read"]);
  const calls = [];
  setSession(session(multiRoleUser()));
  authService.switchRole = async () => updatedUser;
  notifyManager.setScheduler(callback => callback());
  queryClient.setQueryData(["observed-projects"], ["admin-only"]);
  const observer = new QueryObserver(queryClient, {
    queryKey: ["observed-projects"],
    staleTime: 0,
    queryFn: () => {
      calls.push(getSession().user.role);
      return getSession().user.role === USER_ROLES.SYSTEM_ADMIN
        ? oldResponse.promise
        : newResponse.promise;
    },
  });
  const unsubscribe = observer.subscribe(result => results.push(result.data ?? null));

  try {
    assert.deepEqual(observer.getCurrentResult().data, ["admin-only"]);
    const switching = switchActiveRoleAction(USER_ROLES.INSTALLER);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(observer.getCurrentResult().data == null, true);
    assert.equal(results.includes(null), true);
    assert.deepEqual(calls, [USER_ROLES.SYSTEM_ADMIN, USER_ROLES.INSTALLER]);
    oldResponse.resolve(["stale-admin-response"]);
    newResponse.resolve(["installer-visible"]);
    await switching;
    assert.deepEqual(observer.getCurrentResult().data, ["installer-visible"]);
    assert.equal(
      results.some(data => data?.includes("stale-admin-response")),
      false,
    );
    assert.deepEqual(queryClient.getQueryData(["observed-projects"]), ["installer-visible"]);
  } finally {
    unsubscribe();
    observer.destroy();
    notifyManager.setScheduler(callback => setTimeout(callback, 0));
    authService.switchRole = originalSwitch;
  }
});

test("grant revocation notifies mounted disabled observers instead of leaving restricted data visible", async () => {
  const results = [];
  const current = session(multiRoleUser());
  setSession(current);
  queryClient.setQueryData(["revoked-projects"], ["restricted"]);
  notifyManager.setScheduler(callback => callback());
  const observer = new QueryObserver(queryClient, {
    enabled: false,
    queryKey: ["revoked-projects"],
    queryFn: async () => [],
  });
  const unsubscribe = observer.subscribe(result => results.push(result.data ?? null));

  try {
    await applySessionUserAction(current.accessToken, multiRoleUser(USER_ROLES.INSTALLER, []));
    assert.equal(observer.getCurrentResult().data == null, true);
    assert.equal(results.includes(null), true);
  } finally {
    unsubscribe();
    observer.destroy();
    notifyManager.setScheduler(callback => setTimeout(callback, 0));
  }
});

test("refresh failures are logged while a newer session and its storage remain untouched", async () => {
  const originalGetMe = userService.getMe;
  const originalLog = logger.error;
  const errors = [];
  const current = session(multiRoleUser());
  setSession(current);
  persistSession(current, false);
  userService.getMe = async () => {
    throw new Error("offline");
  };
  logger.error = (...args) => errors.push(args);

  try {
    await refreshSessionUserAction(identity.id);
    assert.equal(errors.length, 1);
    assert.deepEqual(getSession(), current);
    assert.deepEqual(readStoredSession(), current);
  } finally {
    userService.getMe = originalGetMe;
    logger.error = originalLog;
  }
});

test("the HTTP interceptor defers stale verification failures to generation-aware session handling", async () => {
  const { AxiosError, AxiosHeaders } = await import("axios");
  const originalAdapter = httpClient.defaults.adapter;
  const originalSwitch = authService.switchRole;
  const request = deferred();
  const response = deferred();
  const updatedUser = multiRoleUser(USER_ROLES.INSTALLER, ["tasks.read"]);
  setSession(session(multiRoleUser()));
  authService.switchRole = async () => updatedUser;
  httpClient.defaults.adapter = config => {
    request.resolve(config);
    return response.promise;
  };

  try {
    const refresh = refreshSessionUserAction(identity.id);
    const config = await request.promise;
    await switchActiveRoleAction(USER_ROLES.INSTALLER);
    response.reject(
      new AxiosError("stale unauthorized", AxiosError.ERR_BAD_REQUEST, config, null, {
        status: 401,
        statusText: "Unauthorized",
        data: {},
        headers: new AxiosHeaders(),
        config,
      }),
    );
    await refresh;
    assert.deepEqual(getSession(), session(updatedUser));
    assert.deepEqual(readStoredSession(), session(updatedUser));
  } finally {
    httpClient.defaults.adapter = originalAdapter;
    authService.switchRole = originalSwitch;
  }
});

test("switch cancellation also protects mounted current-user query observers from old role responses", async () => {
  const { verifySessionUserAction } = await import("../src/actions/session-refresh.action.ts");
  const originalGetMe = userService.getMe;
  const originalSwitch = authService.switchRole;
  const response = deferred();
  const updatedUser = multiRoleUser(USER_ROLES.INSTALLER, ["tasks.read"]);
  setSession(session(multiRoleUser()));
  userService.getMe = () => response.promise;
  authService.switchRole = async () => updatedUser;
  const observer = new QueryObserver(queryClient, {
    queryKey: [...SESSION_USER_QUERY_KEY, identity.id],
    queryFn: verifySessionUserAction,
    retry: false,
  });
  const unsubscribe = observer.subscribe(() => {});

  try {
    await switchActiveRoleAction(USER_ROLES.INSTALLER);
    response.resolve(multiRoleUser());
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(observer.getCurrentResult().data, updatedUser);
    assert.deepEqual(getSession(), session(updatedUser));
  } finally {
    unsubscribe();
    observer.destroy();
    userService.getMe = originalGetMe;
    authService.switchRole = originalSwitch;
  }
});

test("a cross-tab change received during a switch is refreshed afterwards rather than dropped", async () => {
  const originalGetMe = userService.getMe;
  const originalSwitch = authService.switchRole;
  const response = deferred();
  const calls = [];
  const switched = multiRoleUser(USER_ROLES.INSTALLER, ["tasks.read"]);
  const revoked = { ...switched, assignedRoles: [USER_ROLES.INSTALLER], permissions: [] };
  setSession(session(multiRoleUser()));
  authService.switchRole = () => response.promise;
  userService.getMe = async () => {
    calls.push("refresh");
    return revoked;
  };

  try {
    const switching = switchActiveRoleAction(USER_ROLES.INSTALLER);
    const refreshing = refreshSessionUserAction(identity.id);
    assert.deepEqual(calls, []);
    response.resolve(switched);
    await switching;
    await refreshing;
    assert.deepEqual(calls, ["refresh"]);
    assert.deepEqual(getSession(), session(revoked));
  } finally {
    userService.getMe = originalGetMe;
    authService.switchRole = originalSwitch;
  }
});

test(
  "the session channel propagates account role changes and persists the new role and grants",
  { timeout: 2 * TIME_UNITS.SECOND_MS },
  async () => {
    const originalGetMe = userService.getMe;
    const notification = deferred();
    const updatedUser = multiRoleUser(USER_ROLES.INSTALLER, ["tasks.read"]);
    setSession(session(multiRoleUser()));
    persistSession(getSession(), false);
    userService.getMe = async () => updatedUser;
    const unsubscribe = SessionBroadcastManager.subscribeToUserChanges(async userId => {
      await refreshSessionUserAction(userId);
      notification.resolve(userId);
    });

    try {
      SessionBroadcastManager.notifyUserChanged(identity.id);
      assert.equal(await notification.promise, identity.id);
      assert.deepEqual(getSession(), session(updatedUser));
      assert.deepEqual(readStoredSession(), session(updatedUser));
    } finally {
      unsubscribe();
      userService.getMe = originalGetMe;
    }
  },
);

const pendingCustomer = { id: "restricted-customer", name: "Restricted customer" };
const customerPayload = { name: "New customer" };
const pendingTask = {
  id: "restricted-task",
  status: TASK_STATUSES.NOT_STARTED,
  updatedAt: "2026-11-02T10:00:00.000Z",
};
const adminMutationUser = () =>
  multiRoleUser(USER_ROLES.SYSTEM_ADMIN, [
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.TASKS_READ,
    PERMISSIONS.TASKS_STATUS_UPDATE,
  ]);

test("delayed admin createCustomerAction cannot repopulate restricted customer cache after switching to installer", async () => {
  const originalCreate = customerService.create;
  const originalSwitch = authService.switchRole;
  const response = deferred();
  setSession(session(adminMutationUser()));
  customerService.create = () => response.promise;
  authService.switchRole = async () =>
    multiRoleUser(USER_ROLES.INSTALLER, [PERMISSIONS.TASKS_READ]);

  try {
    const creating = createCustomerAction(customerPayload);
    await switchActiveRoleAction(USER_ROLES.INSTALLER);
    response.resolve(pendingCustomer);
    await assert.rejects(creating, AuthorizationContextChangedError);
    assert.equal(queryClient.getQueryData(QUERY_KEYS.customer(pendingCustomer.id)) == null, true);
    assert.deepEqual(getSession().user.permissions, [PERMISSIONS.TASKS_READ]);
  } finally {
    customerService.create = originalCreate;
    authService.switchRole = originalSwitch;
  }
});

for (const change of ["switch", "revoke", "round-trip"]) {
  test(`pending create mutations reject without hook success or navigation callbacks after ${change}`, async () => {
    const originalCreate = customerService.create;
    const originalSwitch = authService.switchRole;
    const response = deferred();
    const calls = [];
    setSession(session(adminMutationUser()));
    customerService.create = () => response.promise;
    authService.switchRole = async role =>
      role === USER_ROLES.SYSTEM_ADMIN
        ? adminMutationUser()
        : multiRoleUser(USER_ROLES.INSTALLER, [PERMISSIONS.TASKS_READ]);
    const observer = new MutationObserver(queryClient, {
      mutationFn: createCustomerAction,
      onSuccess: () => calls.push("hook-success"),
    });
    const unsubscribe = observer.subscribe(() => {});

    try {
      const creating = observer.mutate(customerPayload, {
        onSuccess: () => calls.push("navigate-to-restricted-customer"),
      });
      await new Promise(resolve => setImmediate(resolve));
      if (change === "revoke") {
        await applySessionUserAction(getSession().accessToken, {
          ...adminMutationUser(),
          permissions: [PERMISSIONS.TASKS_READ],
        });
      } else {
        await switchActiveRoleAction(USER_ROLES.INSTALLER);
      }

      if (change === "round-trip") {
        await switchActiveRoleAction(USER_ROLES.SYSTEM_ADMIN);
      }

      response.resolve(pendingCustomer);
      await assert.rejects(creating, AuthorizationContextChangedError);
      assert.deepEqual(calls, []);
      assert.equal(observer.getCurrentResult().status, "error");
      assert.equal(queryClient.getQueryData(QUERY_KEYS.customer(pendingCustomer.id)) == null, true);
    } finally {
      unsubscribe();
      customerService.create = originalCreate;
      authService.switchRole = originalSwitch;
    }
  });
}

for (const outcome of ["success", "failure"]) {
  test(`pending optimistic task ${outcome} cannot overwrite new-role cache or invoke success callbacks after revocation`, async () => {
    const originalUpdate = taskService.updateStatus;
    const response = deferred();
    const calls = [];
    setSession(session(adminMutationUser()));
    queryClient.setQueryData(QUERY_KEYS.task(pendingTask.id), pendingTask);
    taskService.updateStatus = () => response.promise;
    const observer = new MutationObserver(queryClient, {
      mutationFn: updateTaskStatusAction,
      onSuccess: () => calls.push("hook-success"),
    });
    const unsubscribe = observer.subscribe(() => {});

    try {
      const updating = observer.mutate(
        {
          taskId: pendingTask.id,
          status: TASK_STATUSES.IN_PROGRESS,
        },
        { onSuccess: () => calls.push("close-popup") },
      );
      await new Promise(resolve => setImmediate(resolve));
      assert.equal(
        queryClient.getQueryData(QUERY_KEYS.task(pendingTask.id)).status,
        TASK_STATUSES.IN_PROGRESS,
      );
      await applySessionUserAction(getSession().accessToken, {
        ...adminMutationUser(),
        permissions: [PERMISSIONS.TASKS_READ],
      });
      const currentTask = { ...pendingTask, status: TASK_STATUSES.IN_REVIEW };
      queryClient.setQueryData(QUERY_KEYS.task(pendingTask.id), currentTask);
      if (outcome === "failure") {
        response.reject(new Error("old-context write rejected"));
      } else {
        response.resolve({ ...pendingTask, status: TASK_STATUSES.IN_PROGRESS });
      }

      await assert.rejects(updating, AuthorizationContextChangedError);
      assert.deepEqual(queryClient.getQueryData(QUERY_KEYS.task(pendingTask.id)), currentTask);
      assert.deepEqual(calls, []);
      assert.equal(observer.getCurrentResult().status, "error");
    } finally {
      unsubscribe();
      taskService.updateStatus = originalUpdate;
    }
  });
}

test("mutation lifecycle rejects a stale result even when a raw mutation function bypasses action guards", async () => {
  const response = deferred();
  const calls = [];
  setSession(session(adminMutationUser()));
  const observer = new MutationObserver(queryClient, {
    mutationFn: () => response.promise,
    onSuccess: () => calls.push("hook-success"),
  });
  const unsubscribe = observer.subscribe(() => {});

  try {
    const saving = observer.mutate(customerPayload, { onSuccess: () => calls.push("navigate") });
    await new Promise(resolve => setImmediate(resolve));
    await applySessionUserAction(getSession().accessToken, {
      ...adminMutationUser(),
      permissions: [PERMISSIONS.TASKS_READ],
    });
    response.resolve(pendingCustomer);
    await assert.rejects(saving, AuthorizationContextChangedError);
    assert.deepEqual(calls, []);
  } finally {
    unsubscribe();
  }
});

test("a context change during awaited success invalidation blocks subsequent observer navigation", async () => {
  const callbackStarted = deferred();
  const callbackFinished = deferred();
  const calls = [];
  setSession(session(adminMutationUser()));
  const observer = new MutationObserver(queryClient, {
    mutationFn: async () => pendingCustomer,
    onSuccess: async () => {
      callbackStarted.resolve();
      await callbackFinished.promise;
    },
  });
  const unsubscribe = observer.subscribe(() => {});

  try {
    const saving = observer.mutate(customerPayload, { onSuccess: () => calls.push("navigate") });
    await callbackStarted.promise;
    await applySessionUserAction(getSession().accessToken, {
      ...adminMutationUser(),
      permissions: [PERMISSIONS.TASKS_READ],
    });
    callbackFinished.resolve();
    await assert.rejects(saving, AuthorizationContextChangedError);
    assert.deepEqual(calls, []);
  } finally {
    unsubscribe();
  }
});

test("valid pending customer writes preserve cache and navigation across unchanged session verification", async () => {
  const originalCreate = customerService.create;
  const response = deferred();
  const calls = [];
  const currentUser = adminMutationUser();
  setSession(session(currentUser));
  customerService.create = () => response.promise;
  const observer = new MutationObserver(queryClient, {
    mutationFn: createCustomerAction,
    onSuccess: () => calls.push("hook-success"),
  });
  const unsubscribe = observer.subscribe(() => {});

  try {
    const creating = observer.mutate(customerPayload, { onSuccess: id => calls.push(id) });
    await new Promise(resolve => setImmediate(resolve));
    await applySessionUserAction(getSession().accessToken, currentUser);
    response.resolve(pendingCustomer);
    assert.equal(await creating, pendingCustomer.id);
    assert.deepEqual(
      queryClient.getQueryData(QUERY_KEYS.customer(pendingCustomer.id)),
      pendingCustomer,
    );
    assert.deepEqual(calls, ["hook-success", pendingCustomer.id]);
  } finally {
    unsubscribe();
    customerService.create = originalCreate;
  }
});

test("HTTP mutation responses from an old authorization context reject before exposing server data", async () => {
  const originalAdapter = httpClient.defaults.adapter;
  const started = deferred();
  const response = deferred();
  setSession(session(adminMutationUser()));
  httpClient.defaults.adapter = config => {
    started.resolve(config);
    return response.promise;
  };

  try {
    const saving = httpClient.patch("/authorization-context-regression", {});
    const config = await started.promise;
    await applySessionUserAction(getSession().accessToken, {
      ...adminMutationUser(),
      permissions: [PERMISSIONS.TASKS_READ],
    });

    response.resolve({ data: pendingCustomer, status: 200, statusText: "OK", headers: {}, config });
    await assert.rejects(saving, AuthorizationContextChangedError);
  } finally {
    httpClient.defaults.adapter = originalAdapter;
  }
});

test("changed authorization produces an explicit actionable error rather than a silent success", () => {
  const error = new AuthorizationContextChangedError();
  assert.equal(getApiErrorMessage(error), error.message);
  assert.match(error.message, /הרשאות החשבון השתנו/);
});

test("a failed role switch does not invalidate an otherwise authorized pending customer mutation", async () => {
  const originalCreate = customerService.create;
  const originalSwitch = authService.switchRole;
  const response = deferred();
  const calls = [];
  setSession(session(adminMutationUser()));
  customerService.create = () => response.promise;
  authService.switchRole = async () => {
    throw new Error("switch rejected");
  };
  const observer = new MutationObserver(queryClient, { mutationFn: createCustomerAction });
  const unsubscribe = observer.subscribe(() => {});

  try {
    const creating = observer.mutate(customerPayload, { onSuccess: id => calls.push(id) });
    await new Promise(resolve => setImmediate(resolve));
    await assert.rejects(switchActiveRoleAction(USER_ROLES.INSTALLER), /switch rejected/);
    response.resolve(pendingCustomer);
    assert.equal(await creating, pendingCustomer.id);
    assert.deepEqual(calls, [pendingCustomer.id]);
    assert.deepEqual(
      queryClient.getQueryData(QUERY_KEYS.customer(pendingCustomer.id)),
      pendingCustomer,
    );
  } finally {
    unsubscribe();
    customerService.create = originalCreate;
    authService.switchRole = originalSwitch;
  }
});

test("logout invalidates pending customer mutation results even after the same account signs back in", async () => {
  const { clearSessionAction } = await import("../src/actions/session-reset.action.ts");
  const originalCreate = customerService.create;
  const response = deferred();
  const current = session(adminMutationUser());
  setSession(current);
  customerService.create = () => response.promise;

  try {
    const creating = createCustomerAction(customerPayload);
    clearSessionAction();
    setSession(current);
    response.resolve(pendingCustomer);
    await assert.rejects(creating, AuthorizationContextChangedError);
    assert.equal(queryClient.getQueryData(QUERY_KEYS.customer(pendingCustomer.id)) == null, true);
  } finally {
    customerService.create = originalCreate;
  }
});

for (const oldStatus of [HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN]) {
  test(`an old role-switch ${oldStatus} after logout and different-account login cannot clear or refresh the new session`, async () => {
    const { AxiosError, AxiosHeaders } = await import("axios");
    const originalAdapter = httpClient.defaults.adapter;
    const originalNotify = SessionBroadcastManager.notifyUserChanged;
    const started = deferred();
    const oldResponse = deferred();
    const calls = [];
    const notifications = [];
    const newSession = {
      accessToken: "different-account-token",
      user: {
        ...multiRoleUser(USER_ROLES.INSTALLER, [PERMISSIONS.TASKS_READ]),
        id: "different-account",
        email: "different-account@example.invalid",
      },
    };
    setSession(session(multiRoleUser()));
    SessionBroadcastManager.notifyUserChanged = userId => notifications.push(userId);
    httpClient.defaults.adapter = async config => {
      calls.push(config.url);
      if (config.url === API_ENDPOINTS.ROLE_SWITCH) {
        started.resolve(config);
        return oldResponse.promise;
      }

      const data = config.url === API_ENDPOINTS.LOGIN ? newSession : newSession.user;
      return { data, status: 200, statusText: "OK", headers: {}, config };
    };
    const observer = new QueryObserver(queryClient, {
      queryKey: [...SESSION_USER_QUERY_KEY, newSession.user.id],
      queryFn: verifySessionUserAction,
      retry: false,
    });
    const subscriptions = [];

    try {
      const switching = switchActiveRoleAction(USER_ROLES.INSTALLER);
      const switchConfig = await started.promise;
      clearSessionAction();
      await loginAction({
        email: newSession.user.email,
        password: "synthetic-password",
        isRemembered: true,
      });
      assert.equal(SessionRequestManager.isSwitching(), false);
      subscriptions.push(observer.subscribe(() => {}));
      const verified = await observer.refetch();
      assert.equal(verified.status, "success");
      assert.equal(verified.fetchStatus, "idle");
      assert.deepEqual(verified.data, newSession.user);
      const callsBeforeOldResponse = [...calls];
      oldResponse.reject(
        new AxiosError("old role-switch denied", AxiosError.ERR_BAD_REQUEST, switchConfig, null, {
          config: switchConfig,
          status: oldStatus,
          statusText: "Denied",
          data: {},
          headers: new AxiosHeaders(),
        }),
      );
      await assert.rejects(switching, AuthorizationContextChangedError);
      assert.deepEqual(getSession(), newSession);
      assert.deepEqual(readStoredSession(), newSession);
      assert.deepEqual(calls, callsBeforeOldResponse);
      assert.deepEqual(notifications, []);
      assert.equal(observer.getCurrentResult().fetchStatus, "idle");
      assert.deepEqual(observer.getCurrentResult().data, newSession.user);
      assert.equal(calls.filter(url => url === API_ENDPOINTS.MY_USER).length > 0, true);
    } finally {
      subscriptions.forEach(unsubscribe => unsubscribe());
      observer.destroy();
      httpClient.defaults.adapter = originalAdapter;
      SessionBroadcastManager.notifyUserChanged = originalNotify;
    }
  });
}

test("logout and relogin retire a pending switch so the new account verifies before the old switch finishes", async () => {
  const originalSwitch = authService.switchRole;
  const originalLogin = authService.login;
  const originalGetMe = userService.getMe;
  const oldResponse = deferred();
  const started = deferred();
  const calls = [];
  const newSession = {
    accessToken: "new-verification-token",
    user: {
      ...multiRoleUser(USER_ROLES.INSTALLER, [PERMISSIONS.TASKS_READ]),
      id: "new-verification-user",
    },
  };
  setSession(session(multiRoleUser()));
  authService.switchRole = () => {
    started.resolve();
    return oldResponse.promise;
  };
  authService.login = async () => newSession;
  userService.getMe = async () => {
    calls.push(getSession().user.id);
    return newSession.user;
  };
  const observer = new QueryObserver(queryClient, {
    queryKey: [...SESSION_USER_QUERY_KEY, newSession.user.id],
    queryFn: verifySessionUserAction,
    retry: false,
  });
  const subscriptions = [];

  try {
    const switching = switchActiveRoleAction(USER_ROLES.INSTALLER);
    await started.promise;
    const waiter = SessionRequestManager.waitForSwitch();
    clearSessionAction();
    await loginAction({
      email: "new@example.invalid",
      password: "synthetic-password",
      isRemembered: false,
    });
    await waiter;
    subscriptions.push(observer.subscribe(() => {}));
    const verified = await observer.refetch();
    assert.equal(verified.status, "success");
    assert.equal(verified.fetchStatus, "idle");
    assert.deepEqual(verified.data, newSession.user);
    assert.deepEqual(calls, [newSession.user.id]);
    oldResponse.resolve(multiRoleUser(USER_ROLES.INSTALLER, [PERMISSIONS.TASKS_READ]));
    await switching;
    assert.deepEqual(getSession(), newSession);
    assert.equal(SessionRequestManager.isSwitching(), false);
    assert.equal(observer.getCurrentResult().fetchStatus, "idle");
    assert.deepEqual(observer.getCurrentResult().data, newSession.user);
  } finally {
    subscriptions.forEach(unsubscribe => unsubscribe());
    observer.destroy();
    authService.switchRole = originalSwitch;
    authService.login = originalLogin;
    userService.getMe = originalGetMe;
  }
});

test("an old switch completion cannot release a newer account's switch or supersede its verification", async () => {
  const originalSwitch = authService.switchRole;
  const originalLogin = authService.login;
  const originalGetMe = userService.getMe;
  const oldResponse = deferred();
  const newResponse = deferred();
  const started = deferred();
  const newStarted = deferred();
  const calls = [];
  const newSession = {
    accessToken: "switch-owner-token",
    user: { ...multiRoleUser(), id: "switch-owner-account" },
  };
  const switchedUser = {
    ...newSession.user,
    role: USER_ROLES.INSTALLER,
    permissions: [PERMISSIONS.TASKS_READ],
  };
  setSession(session(multiRoleUser()));
  authService.switchRole = () => {
    if (getSession().user.id === identity.id) {
      started.resolve();
      return oldResponse.promise;
    }

    newStarted.resolve();
    return newResponse.promise;
  };
  authService.login = async () => newSession;
  userService.getMe = async () => {
    calls.push(getSession().user.id);
    return switchedUser;
  };

  try {
    const oldSwitch = switchActiveRoleAction(USER_ROLES.INSTALLER);
    await started.promise;
    clearSessionAction();
    await loginAction({
      email: "owner@example.invalid",
      password: "synthetic-password",
      isRemembered: false,
    });
    const newSwitch = switchActiveRoleAction(USER_ROLES.INSTALLER);
    await newStarted.promise;
    const verifying = verifySessionUserAction();
    oldResponse.resolve(multiRoleUser(USER_ROLES.INSTALLER));
    await oldSwitch;
    assert.equal(SessionRequestManager.isSwitching(), true);
    assert.deepEqual(calls, []);
    assert.deepEqual(getSession(), newSession);
    newResponse.resolve(switchedUser);
    await newSwitch;
    assert.deepEqual(await verifying, switchedUser);
    assert.equal(SessionRequestManager.isSwitching(), false);
    assert.deepEqual(calls, [newSession.user.id]);
    assert.deepEqual(getSession().user, switchedUser);
  } finally {
    authService.switchRole = originalSwitch;
    authService.login = originalLogin;
    userService.getMe = originalGetMe;
  }
});

test("relogin without an intervening logout also retires previous switch ownership", async () => {
  const originalSwitch = authService.switchRole;
  const originalLogin = authService.login;
  const originalGetMe = userService.getMe;
  const started = deferred();
  const oldResponse = deferred();
  const currentUser = {
    ...multiRoleUser(USER_ROLES.INSTALLER, [PERMISSIONS.TASKS_READ]),
    id: "replacement-account",
  };
  const current = { accessToken: "replacement-session-token", user: currentUser };
  const calls = [];
  setSession(session(multiRoleUser()));
  authService.switchRole = () => {
    started.resolve();
    return oldResponse.promise;
  };
  authService.login = async () => current;
  userService.getMe = async () => {
    calls.push(getSession().user.id);
    return currentUser;
  };

  try {
    const switching = switchActiveRoleAction(USER_ROLES.INSTALLER);
    await started.promise;
    await loginAction({
      email: "replacement@example.invalid",
      password: "synthetic-password",
      isRemembered: true,
    });
    assert.equal(SessionRequestManager.isSwitching(), false);
    assert.deepEqual(await verifySessionUserAction(), currentUser);
    oldResponse.resolve(multiRoleUser(USER_ROLES.INSTALLER));
    await switching;
    assert.deepEqual(calls, [currentUser.id]);
    assert.deepEqual(getSession(), current);
    assert.deepEqual(readStoredSession(), current);
  } finally {
    authService.switchRole = originalSwitch;
    authService.login = originalLogin;
    userService.getMe = originalGetMe;
  }
});

test("a switch retired while query cancellation is pending never sends its request as the new account", async () => {
  const originalCancel = queryClient.cancelQueries;
  const originalSwitch = authService.switchRole;
  const cancellation = deferred();
  const calls = [];
  setSession(session(multiRoleUser()));
  queryClient.cancelQueries = () => cancellation.promise;
  authService.switchRole = async () => {
    calls.push(getSession().user.id);
    return multiRoleUser(USER_ROLES.INSTALLER);
  };

  try {
    const switching = switchActiveRoleAction(USER_ROLES.INSTALLER);
    clearSessionAction();
    const current = {
      accessToken: "new-cancellation-account-token",
      user: { ...multiRoleUser(), id: "new-cancellation-account" },
    };
    setSession(current);
    cancellation.resolve();
    await assert.rejects(switching, AuthorizationContextChangedError);
    assert.deepEqual(calls, []);
    assert.deepEqual(getSession(), current);
    assert.equal(SessionRequestManager.isSwitching(), false);
  } finally {
    queryClient.cancelQueries = originalCancel;
    authService.switchRole = originalSwitch;
  }
});

test(
  "a real HTTP role-switch 403 releases ownership before mounted current-user verification and rejects explicitly",
  { timeout: 2 * TIME_UNITS.SECOND_MS },
  async () => {
    const { AxiosError, AxiosHeaders } = await import("axios");
    const originalAdapter = httpClient.defaults.adapter;
    const currentUser = multiRoleUser();
    const calls = [];
    const queryKey = [...SESSION_USER_QUERY_KEY, currentUser.id];
    setSession(session(currentUser));
    persistSession(getSession(), false);
    queryClient.setQueryData(queryKey, currentUser);
    httpClient.defaults.adapter = async config => {
      calls.push(config.url);
      if (config.url === API_ENDPOINTS.ROLE_SWITCH) {
        throw new AxiosError("role denied", AxiosError.ERR_BAD_REQUEST, config, null, {
          config,
          status: HTTP_STATUS.FORBIDDEN,
          statusText: "Forbidden",
          headers: new AxiosHeaders(),
          data: { message: "Selected role is no longer assigned" },
        });
      }

      assert.equal(config.url, API_ENDPOINTS.MY_USER);
      assert.equal(SessionRequestManager.isSwitching(), false);
      return { data: currentUser, status: 200, statusText: "OK", headers: {}, config };
    };
    const observer = new QueryObserver(queryClient, {
      queryKey,
      queryFn: verifySessionUserAction,
      staleTime: Infinity,
      retry: false,
    });
    const unsubscribe = observer.subscribe(() => {});

    try {
      await assert.rejects(switchActiveRoleAction(USER_ROLES.INSTALLER), error => {
        assert.equal(error.response?.status, HTTP_STATUS.FORBIDDEN);
        assert.match(getApiErrorMessage(error), /Selected role is no longer assigned/);
        return true;
      });
      assert.deepEqual(calls, [API_ENDPOINTS.ROLE_SWITCH, API_ENDPOINTS.MY_USER]);
      assert.equal(SessionRequestManager.isSwitching(), false);
      assert.equal(observer.getCurrentResult().status, "success");
      assert.equal(observer.getCurrentResult().fetchStatus, "idle");
      assert.deepEqual(getSession(), session(currentUser));
      assert.deepEqual(readStoredSession(), session(currentUser));
    } finally {
      unsubscribe();
      observer.destroy();
      httpClient.defaults.adapter = originalAdapter;
    }
  },
);

test("a superseded real HTTP switch denial cannot release newer switch ownership or trigger verification", async () => {
  const { AxiosError, AxiosHeaders } = await import("axios");
  const originalAdapter = httpClient.defaults.adapter;
  const oldStarted = deferred();
  const newStarted = deferred();
  const oldResponse = deferred();
  const newResponse = deferred();
  const responses = [oldResponse, newResponse];
  const started = [oldStarted, newStarted];
  const calls = [];
  const updatedUser = multiRoleUser(USER_ROLES.INSTALLER, [PERMISSIONS.TASKS_READ]);
  setSession(session(multiRoleUser()));
  httpClient.defaults.adapter = config => {
    calls.push(config.url);
    const response = responses.shift();
    started.shift().resolve(config);
    return response.promise;
  };

  try {
    const first = switchActiveRoleAction(USER_ROLES.INSTALLER);
    const firstConfig = await oldStarted.promise;
    const second = switchActiveRoleAction(USER_ROLES.INSTALLER);
    const secondConfig = await newStarted.promise;
    oldResponse.reject(
      new AxiosError("superseded role denied", AxiosError.ERR_BAD_REQUEST, firstConfig, null, {
        config: firstConfig,
        status: HTTP_STATUS.FORBIDDEN,
        statusText: "Forbidden",
        headers: new AxiosHeaders(),
        data: {},
      }),
    );
    await assert.rejects(first, error => error.response?.status === HTTP_STATUS.FORBIDDEN);
    assert.equal(SessionRequestManager.isSwitching(), true);
    assert.deepEqual(calls, [API_ENDPOINTS.ROLE_SWITCH, API_ENDPOINTS.ROLE_SWITCH]);
    newResponse.resolve({
      data: updatedUser,
      status: 200,
      statusText: "OK",
      headers: {},
      config: secondConfig,
    });
    await second;
    assert.equal(SessionRequestManager.isSwitching(), false);
    assert.deepEqual(getSession().user, updatedUser);
  } finally {
    httpClient.defaults.adapter = originalAdapter;
  }
});
