import { test } from "node:test";
import assert from "node:assert/strict";
import type { ReactElement } from "react";
import { AxiosError, AxiosHeaders } from "axios";
import Button from "../src/components/Button/Button";
import { QueryObserver } from "@tanstack/react-query";
import { setSession } from "../src/store/session.store";
import { logger } from "../src/utilities/logger.utility";
import { userService } from "../src/services/user.service";
import { queryClient } from "../src/providers/query-client";
import { TIME_UNITS } from "../src/constants/time.constant";
import type { IApiUser } from "../src/interfaces/api.interface";
import { httpClient } from "../src/services/http-client.service";
import { PERMISSIONS } from "../src/constants/permission.constant";
import RadioButton from "../src/components/RadioButton/RadioButton";
import { EMPLOYEES_COPY } from "../src/constants/employee.constant";
import UserMenuButton from "../src/components/TopBar/UserMenuButton";
import GenericPopup from "../src/components/GenericPopup/GenericPopup";
import { act, create, type ReactTestInstance } from "react-test-renderer";
import { QueryClientProvider, notifyManager } from "@tanstack/react-query";
import { switchActiveRoleAction } from "../src/actions/role-switch.action";
import { API_ENDPOINTS, HTTP_STATUS } from "../src/constants/api.constant";
import { toEmployee, toPerson } from "../src/utilities/mappers/user.mapper";
import { SESSION_USER_QUERY_KEY } from "../src/constants/permission.constant";
import { verifySessionUserAction } from "../src/actions/session-refresh.action";
import { USER_ROLES, USER_ROLE_LABELS } from "../src/constants/user-role.constant";
import EditEmployeeRolesPopup from "../src/pages/employees/components/EditEmployeeRolesPopup";
import RoleAssignmentFields from "../src/components/RoleAssignmentFields/RoleAssignmentFields";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
notifyManager.setScheduler(callback => callback());

const user: IApiUser = {
  id: "role-user",
  firstName: "Rina",
  lastName: "Example",
  employeeNumber: "104",
  email: "rina@example.invalid",
  phone: "0500000000",
  deletedAt: null,
  role: USER_ROLES.SYSTEM_ADMIN,
  assignedRoles: [USER_ROLES.SYSTEM_ADMIN, USER_ROLES.INSTALLER],
};

const noop = (): void => {};

const renderComponent = async (element: ReactElement): Promise<ReturnType<typeof create>> => {
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  await act(async () => {
    state.renderer = create(element);
  });
  assert.ok(state.renderer);
  return state.renderer;
};

const deferred = <TValue,>(): {
  promise: Promise<TValue>;
  resolve: (value: TValue) => void;
  reject: (error: Error) => void;
} => {
  const state: {
    resolve: (value: TValue) => void;
    reject: (error: Error) => void;
  } = { resolve: noop, reject: noop };
  const promise = new Promise<TValue>((resolve, reject) => {
    state.resolve = resolve;
    state.reject = reject;
  });
  return { promise, resolve: state.resolve, reject: state.reject };
};

test("generic radio preserves checked standalone button activation", async () => {
  const selections: string[] = [];
  const renderer = await renderComponent(
    <RadioButton checked label="Standalone" onSelect={() => selections.push("selected")} />,
  );
  try {
    const button = renderer.root.findByType("button");
    assert.equal(button.props.type, "button");
    assert.equal(button.props["aria-checked"], true);
    await act(async () => button.props.onClick());
    assert.deepEqual(selections, ["selected"]);
    assert.equal(renderer.root.findAllByType("input").length, 0);
  } finally {
    await act(async () => renderer.unmount());
  }
});

test("assigned checkboxes keep their group while active radios share a described native group", async () => {
  const renderer = await renderComponent(
    <>
      <RoleAssignmentFields
        activeRole={user.role}
        onActiveRoleChange={noop}
        onAssignedRolesChange={noop}
        assignedRoles={user.assignedRoles}
      />
      <RoleAssignmentFields
        onActiveRoleChange={noop}
        onAssignedRolesChange={noop}
        activeRole={USER_ROLES.INSTALLER}
        assignedRoles={user.assignedRoles}
      />
    </>,
  );

  try {
    const groups = renderer.root
      .findAllByType("div")
      .filter(
        node =>
          node.props.role === "group" && node.props["aria-label"] === EMPLOYEES_COPY.ROLE_LABEL,
      );
    assert.equal(groups.length, 2);
    const radios = groups.map(group =>
      group.findAllByType("input").filter(input => input.props.type === "radio"),
    );
    assert.equal(radios[0].length, 2);
    assert.equal(renderer.root.findAllByType(RadioButton).length, 4);
    assert.equal(radios[0].filter(input => input.props.checked).length, 1);
    assert.equal(radios[1].filter(input => input.props.checked).length, 1);
    assert.deepEqual(
      radios[0].map(input => input.props["aria-label"]),
      user.assignedRoles.map(role => USER_ROLE_LABELS[role]),
    );
    assert.equal(radios[0][0].props.name, radios[0][1].props.name);
    assert.notEqual(radios[0][0].props.name, radios[1][0].props.name);
    assert.equal(radios[0][0].props["aria-describedby"], radios[0][1].props["aria-describedby"]);
    assert.notEqual(radios[0][0].props["aria-describedby"], radios[1][0].props["aria-describedby"]);
    const activeRoleDescriptions = renderer.root
      .findAllByType("span")
      .filter(node => node.props.id === radios[0][0].props["aria-describedby"]);
    assert.equal(activeRoleDescriptions.length, 1);
    assert.equal(activeRoleDescriptions[0].children[0], EMPLOYEES_COPY.ACTIVE_ROLE_LABEL);
    assert.equal(
      radios[0].every(input => input.props.tabIndex !== -1),
      true,
    );
  } finally {
    await act(async () => renderer.unmount());
  }
});

test("one assigned role omits the selector and an empty assignment shows the required alert", async () => {
  const renderer = await renderComponent(
    <RoleAssignmentFields
      activeRole={user.role}
      onActiveRoleChange={noop}
      assignedRoles={[user.role]}
      onAssignedRolesChange={noop}
    />,
  );

  try {
    assert.equal(renderer.root.findAllByType(RadioButton).length, 0);
    await act(async () => {
      renderer.update(
        <RoleAssignmentFields
          activeRole={null}
          assignedRoles={[]}
          onActiveRoleChange={noop}
          onAssignedRolesChange={noop}
        />,
      );
    });
    assert.ok(renderer.root.findAllByProps({ role: "alert" }).length > 0);
  } finally {
    await act(async () => renderer.unmount());
  }
});

for (const failure of [
  new Error("offline"),
  new AxiosError("conflict", null, null, null, {
    status: 409,
    statusText: "Conflict",
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { message: "Cannot remove the final system administrator" },
  }),
]) {
  test(`employee role popup awaits mutation and remains open with server errors: ${failure.message}`, async () => {
    const originalUpdate = userService.update;
    const originalLog = logger.error;
    const response = deferred<IApiUser>();
    const state = { closed: 0 };
    const errors: unknown[] = [];
    userService.update = () => response.promise;
    logger.error = (message, context): void => {
      errors.push({ message, context });
    };
    const renderer = await renderComponent(
      <QueryClientProvider client={queryClient}>
        <EditEmployeeRolesPopup
          employee={toEmployee(user)}
          onClose={() => {
            state.closed += 1;
          }}
        />
      </QueryClientProvider>,
    );

    try {
      const getSaveButton = (): ReactTestInstance | null =>
        renderer.root
          .findAllByType(Button)
          .find(button => button.props.text === EMPLOYEES_COPY.SAVE_ROLE_CHANGES) ?? null;
      const button = getSaveButton();
      assert.ok(button);
      const pending: { action: Promise<void> | null } = { action: null };
      await act(async () => {
        pending.action = button.props.onClick();
      });
      assert.equal(state.closed, 0);
      assert.equal(getSaveButton()?.props.isLoading, true);
      assert.equal(renderer.root.findByType(GenericPopup).props.open, true);
      await act(async () => {
        response.reject(failure);
        await pending.action;
        await new Promise(resolve => setImmediate(resolve));
      });
      assert.equal(state.closed, 0);
      assert.equal(renderer.root.findByType(GenericPopup).props.open, true);
      assert.equal(getSaveButton()?.props.isLoading, false);
      assert.ok(renderer.root.findAllByProps({ role: "alert" }).length > 0);
      assert.ok(errors.length > 0);
      if (failure instanceof AxiosError) {
        assert.ok(JSON.stringify(renderer.toJSON()).includes("final system administrator"));
      }
    } finally {
      await act(async () => renderer.unmount());
      userService.update = originalUpdate;
      logger.error = originalLog;
      queryClient.clear();
    }
  });
}

test("successful role save closes only after the awaited server mutation", async () => {
  const originalUpdate = userService.update;
  const response = deferred<IApiUser>();
  const state = { closed: 0 };
  userService.update = () => response.promise;
  const renderer = await renderComponent(
    <QueryClientProvider client={queryClient}>
      <EditEmployeeRolesPopup
        employee={toEmployee(user)}
        onClose={() => {
          state.closed += 1;
        }}
      />
    </QueryClientProvider>,
  );

  try {
    const button = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === EMPLOYEES_COPY.SAVE_ROLE_CHANGES);
    assert.ok(button);
    const pending: { action: Promise<void> | null } = { action: null };
    await act(async () => {
      pending.action = button.props.onClick();
    });
    assert.equal(state.closed, 0);
    await act(async () => {
      response.resolve(user);
      await pending.action;
    });
    assert.equal(state.closed, 1);
  } finally {
    await act(async () => renderer.unmount());
    userService.update = originalUpdate;
    queryClient.clear();
  }
});

test("a failed header switch logs the error, keeps the menu open and retains the current role", async () => {
  const originalLog = logger.error;
  const errors: unknown[] = [];
  logger.error = (message, context): void => {
    errors.push({ message, context });
  };
  const renderer = await renderComponent(
    <UserMenuButton
      user={toPerson(user)}
      activeRole={user.role}
      assignedRoles={user.assignedRoles}
      onRoleChange={async () => {
        throw new Error("role assignment revoked");
      }}
    />,
  );

  try {
    const trigger = renderer.root.findByType("button");
    await act(async () => trigger.props.onClick({ currentTarget: {} }));
    const nextRole = renderer.root
      .findAllByProps({ role: "menuitemradio" })
      .find(item => item.props["aria-checked"] === false);
    assert.ok(nextRole);
    await act(async () => nextRole.props.onClick());
    assert.equal(errors.length, 1);
    assert.ok(renderer.root.findAllByProps({ role: "alert" }).length > 0);
    assert.ok(renderer.root.findAllByProps({ "aria-checked": true }).length > 0);
    assert.equal(renderer.root.findByType("button").props["aria-expanded"], true);
  } finally {
    await act(async () => renderer.unmount());
    logger.error = originalLog;
  }
});

test("an authorization change while a popup action is pending prevents its success close and reports failure", async () => {
  const originalLog = logger.error;
  const response = deferred<void>();
  const state = { closed: 0 };
  const errors: unknown[] = [];
  setSession({
    accessToken: "popup-authorization-test",
    user: { ...user, permissions: [PERMISSIONS.EMPLOYEES_ROLES_ASSIGN] },
  });

  logger.error = (message, context): void => {
    errors.push({ message, context });
  };
  const renderer = await renderComponent(
    <GenericPopup
      open
      title={EMPLOYEES_COPY.EDIT_ROLES_TITLE}
      onClose={() => {
        state.closed += 1;
      }}
      buttons={{
        primary: {
          text: EMPLOYEES_COPY.SAVE_ROLE_CHANGES,
          onClick: () => response.promise,
        },
      }}
    />,
  );

  try {
    const button = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === EMPLOYEES_COPY.SAVE_ROLE_CHANGES);
    assert.ok(button);
    const pending: { action: Promise<void> | null } = { action: null };
    await act(async () => {
      pending.action = button.props.onClick();
    });
    setSession({
      accessToken: "popup-authorization-test",
      user: { ...user, role: USER_ROLES.INSTALLER, permissions: [PERMISSIONS.TASKS_READ] },
    });
    await act(async () => {
      response.resolve();
      await pending.action;
    });
    assert.equal(state.closed, 0);
    assert.equal(errors.length, 1);
    assert.ok(renderer.root.findAllByProps({ role: "alert" }).length > 0);
    assert.ok(JSON.stringify(renderer.toJSON()).includes("הרשאות החשבון השתנו"));
  } finally {
    await act(async () => renderer.unmount());
    setSession(null);
    logger.error = originalLog;
  }
});

test(
  "real HTTP switch denial verifies the mounted session and clears menu pending while displaying the server error",
  { timeout: 3 * TIME_UNITS.SECOND_MS },
  async () => {
    const originalAdapter = httpClient.defaults.adapter;
    const originalLog = logger.error;
    const errors: unknown[] = [];
    const calls: string[] = [];
    const currentUser = { ...user, permissions: [PERMISSIONS.TASKS_READ] };
    const queryKey = [...SESSION_USER_QUERY_KEY, user.id];
    setSession({ accessToken: "role-denial-menu-test", user: currentUser });
    queryClient.setQueryData(queryKey, currentUser);
    logger.error = (message, context): void => {
      errors.push({ message, context });
    };
    httpClient.defaults.adapter = async config => {
      calls.push(config.url ?? "");
      if (config.url === API_ENDPOINTS.ROLE_SWITCH) {
        throw new AxiosError("role denied", AxiosError.ERR_BAD_REQUEST, config, null, {
          config,
          status: HTTP_STATUS.FORBIDDEN,
          statusText: "Forbidden",
          headers: new AxiosHeaders(),
          data: { message: "Selected role is no longer assigned" },
        });
      }

      return { data: currentUser, status: 200, statusText: "OK", headers: {}, config };
    };
    const observer = new QueryObserver(queryClient, {
      queryKey,
      queryFn: verifySessionUserAction,
      staleTime: Infinity,
      retry: false,
    });
    const unsubscribe = observer.subscribe(noop);
    const renderer = await renderComponent(
      <UserMenuButton
        user={toPerson(user)}
        activeRole={user.role}
        assignedRoles={user.assignedRoles}
        onRoleChange={switchActiveRoleAction}
      />,
    );

    try {
      await act(async () =>
        renderer.root.findByType("button").props.onClick({ currentTarget: {} }),
      );
      const option = renderer.root
        .findAllByProps({ role: "menuitemradio" })
        .find(item => item.props["aria-checked"] === false);
      assert.ok(option);
      await act(async () => option.props.onClick());
      assert.deepEqual(calls, [API_ENDPOINTS.ROLE_SWITCH, API_ENDPOINTS.MY_USER]);
      assert.equal(observer.getCurrentResult().fetchStatus, "idle");
      assert.equal(observer.getCurrentResult().status, "success");
      assert.equal(renderer.root.findByType("button").props["aria-expanded"], true);
      assert.ok(renderer.root.findAllByProps({ role: "alert" }).length > 0);
      assert.ok(JSON.stringify(renderer.toJSON()).includes("Selected role is no longer assigned"));
      assert.equal(errors.length, 1);
      const options = renderer.root.findAllByProps({ role: "menuitemradio" });
      assert.equal(
        options.every(item => !item.props.disabled),
        true,
      );
    } finally {
      await act(async () => renderer.unmount());
      unsubscribe();
      observer.destroy();
      httpClient.defaults.adapter = originalAdapter;
      logger.error = originalLog;
      setSession(null);
      queryClient.clear();
    }
  },
);
