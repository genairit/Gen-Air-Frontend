import {
  USER_ROLES,
  USER_ROLE_VALUES,
  USER_ROLE_LABELS,
} from "../src/constants/user-role.constant";

import { test } from "node:test";
import assert from "node:assert/strict";
import type { ReactElement } from "react";
import { AxiosError, AxiosHeaders } from "axios";
import Button from "../src/components/Button/Button";
import { QueryObserver } from "@tanstack/react-query";
import { setSession } from "../src/store/session.store";
import { logger } from "../src/utilities/logger.utility";
import CheckBox from "../src/components/CheckBox/CheckBox";
import { userService } from "../src/services/user.service";
import { queryClient } from "../src/providers/query-client";
import { TIME_UNITS } from "../src/constants/time.constant";
import type { IApiUser } from "../src/interfaces/api.interface";
import { httpClient } from "../src/services/http-client.service";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { PERMISSIONS } from "../src/constants/permission.constant";
import InlineError from "../src/components/InlineError/InlineError";
import RadioButton from "../src/components/RadioButton/RadioButton";
import { EMPLOYEES_COPY } from "../src/constants/employee.constant";
import UserMenuButton from "../src/components/TopBar/UserMenuButton";
import GenericPopup from "../src/components/GenericPopup/GenericPopup";
import { act, create, type ReactTestInstance } from "react-test-renderer";
import { APARTMENT_TEAM_COPY } from "../src/constants/apartment.constant";
import { switchActiveRoleAction } from "../src/actions/role-switch.action";
import { API_ENDPOINTS, HTTP_STATUS } from "../src/constants/api.constant";
import { toEmployee, toPerson } from "../src/utilities/mappers/user.mapper";
import { SESSION_USER_QUERY_KEY } from "../src/constants/permission.constant";
import { verifySessionUserAction } from "../src/actions/session-refresh.action";
import { QueryClient, QueryClientProvider, notifyManager } from "@tanstack/react-query";
import EditEmployeeRolesPopup from "../src/pages/employees/components/EditEmployeeRolesPopup";
import RoleAssignmentFields from "../src/components/RoleAssignmentFields/RoleAssignmentFields";
import ApartmentEngineerPicker from "../src/pages/apartment/components/ApartmentEngineerPicker";

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

test("apartment engineer picker selects and clears the dedicated assignment", async () => {
  const engineer = {
    ...user,
    id: "engineer-1",
    role: USER_ROLES.ENGINEER,
    assignedRoles: [USER_ROLES.ENGINEER],
  };
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(QUERY_KEYS.users({ search: "", role: USER_ROLES.ENGINEER }), [engineer]);
  const selected: (string | null)[] = [];
  const renderer = await renderComponent(
    <QueryClientProvider client={client}>
      <ApartmentEngineerPicker value={engineer.id} onChange={id => selected.push(id)} />
    </QueryClientProvider>,
  );
  try {
    const picker = renderer.root.findByType("select");
    assert.equal(picker.props.options[0], APARTMENT_TEAM_COPY.NO_ENGINEER);
    assert.ok(picker.props.value.includes("Rina"));
    await act(async () => picker.props.onChange(picker.props.options[1]));
    await act(async () => picker.props.onChange(APARTMENT_TEAM_COPY.NO_ENGINEER));
    assert.deepEqual(selected, [engineer.id, null]);
  } finally {
    await act(async () => renderer.unmount());
    client.clear();
  }
});

test("apartment engineer picker keeps the selected member visible and offers retry after a load error", async () => {
  const engineer = {
    ...user,
    id: "engineer-1",
    role: USER_ROLES.ENGINEER,
    assignedRoles: [USER_ROLES.ENGINEER],
  };
  const previous = userService.getByFilter;
  let calls = 0;
  userService.getByFilter = async () => {
    calls += 1;
    throw new Error("offline");
  };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const renderer = await renderComponent(
    <QueryClientProvider client={client}>
      <ApartmentEngineerPicker
        onChange={noop}
        value={engineer.id}
        selectedMember={{
          id: "member-1",
          userId: engineer.id,
          role: USER_ROLES.ENGINEER,
          user: engineer,
        }}
      />
    </QueryClientProvider>,
  );
  try {
    const picker = renderer.root.findByType("select");
    assert.ok(picker.props.value.includes("Rina"));
    assert.equal(renderer.root.findAllByType(InlineError).length, 1);
    const retry = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === APARTMENT_TEAM_COPY.RETRY);
    assert.ok(retry);
    await act(async () => retry.props.onClick());
    assert.equal(calls, 2);
  } finally {
    userService.getByFilter = previous;
    await act(async () => renderer.unmount());
    client.clear();
  }
});

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

test("employee role assignments show every account role with one shared helper per form", async () => {
  const renderer = await renderComponent(
    <>
      <RoleAssignmentFields onAssignedRolesChange={noop} assignedRoles={user.assignedRoles} />
      <RoleAssignmentFields onAssignedRolesChange={noop} assignedRoles={user.assignedRoles} />
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
    assert.deepEqual(
      groups.map(group => group.findAllByType(CheckBox).map(option => option.props.text)),
      [USER_ROLE_VALUES, USER_ROLE_VALUES].map(roles => roles.map(role => USER_ROLE_LABELS[role])),
    );
    assert.equal(renderer.root.findAllByType(RadioButton).length, 0);
    assert.notEqual(groups[0].props["aria-describedby"], groups[1].props["aria-describedby"]);
    const assignmentHelpers = renderer.root
      .findAllByType("span")
      .filter(node => node.props.id === groups[0].props["aria-describedby"]);
    assert.equal(assignmentHelpers.length, 1);
    assert.equal(assignmentHelpers[0].children[0], EMPLOYEES_COPY.ROLE_ASSIGNMENT_HELPER);
  } finally {
    await act(async () => renderer.unmount());
  }
});

test("header role menu switches to the purchasing and execution account role", async () => {
  const changes: string[] = [];
  const renderer = await renderComponent(
    <UserMenuButton
      user={toPerson(user)}
      activeRole={USER_ROLES.SYSTEM_ADMIN}
      onRoleChange={async role => {
        changes.push(role);
      }}
      assignedRoles={[USER_ROLES.SYSTEM_ADMIN, USER_ROLES.PURCHASING_EXECUTION_MANAGER]}
    />,
  );
  try {
    await act(async () => renderer.root.findByType("button").props.onClick({ currentTarget: {} }));
    assert.ok(JSON.stringify(renderer.toJSON()).includes("מנהל רכש וביצוע"));
    const option = renderer.root
      .findAllByProps({ role: "menuitemradio" })
      .find(item => item.props["aria-checked"] === false);
    assert.ok(option);
    await act(async () => option.props.onClick());
    assert.deepEqual(changes, [USER_ROLES.PURCHASING_EXECUTION_MANAGER]);
  } finally {
    await act(async () => renderer.unmount());
  }
});

test("an empty employee role assignment shows the required alert", async () => {
  const renderer = await renderComponent(
    <RoleAssignmentFields assignedRoles={[user.role]} onAssignedRolesChange={noop} />,
  );

  try {
    await act(async () => {
      renderer.update(<RoleAssignmentFields assignedRoles={[]} onAssignedRolesChange={noop} />);
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
  const calls: Parameters<typeof userService.update>[] = [];
  userService.update = (userId, changes) => {
    calls.push([userId, changes]);
    return response.promise;
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
    const button = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === EMPLOYEES_COPY.SAVE_ROLE_CHANGES);
    assert.ok(button);
    const pending: { action: Promise<void> | null } = { action: null };
    await act(async () => {
      pending.action = button.props.onClick();
    });
    assert.deepEqual(calls, [[user.id, { assignedRoles: user.assignedRoles }]]);
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
