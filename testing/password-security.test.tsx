import { test } from "node:test";
import assert from "node:assert/strict";
import { AxiosError, AxiosHeaders } from "axios";
import Button from "../src/components/Button/Button";
import LoginPage from "../src/pages/login/LoginPage";
import { getSession, setSession } from "../src/store/session.store";
import { userService } from "../src/services/user.service";
import { queryClient } from "../src/providers/query-client";
import { LOGIN_COPY } from "../src/constants/login.constant";
import TextField from "../src/components/TextField/TextField";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ROUTE_PATHS } from "../src/constants/routes.constant";
import { SETTINGS_COPY } from "../src/constants/settings.constant";
import { USER_ROLES } from "../src/constants/user-role.constant";
import InlineError from "../src/components/InlineError/InlineError";
import NoticeBanner from "../src/components/NoticeBanner/NoticeBanner";
import PasswordCard from "../src/pages/settings/components/PasswordCard";
import { act, create, type ReactTestInstance } from "react-test-renderer";
import { canSubmitEmployeeForm } from "../src/utilities/employee.utility";
import { QueryClientProvider, notifyManager } from "@tanstack/react-query";
import { API_ERROR_CODES, HTTP_STATUS } from "../src/constants/api.constant";
import AddEmployeeCard from "../src/pages/employees/components/AddEmployeeCard";
import { EMPLOYEES_COPY, EMPTY_EMPLOYEE_FORM } from "../src/constants/employee.constant";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
notifyManager.setScheduler(callback => callback());

const renderComponent = async (element: React.ReactElement) => {
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  await act(async () => {
    state.renderer = create(element);
  });
  assert.ok(state.renderer);
  return state.renderer;
};

const fieldByTitle = (root: ReactTestInstance, title: string) => {
  const field = root.findAllByType(TextField).find(item => item.props.title === title);
  assert.ok(field);
  return field;
};

const enterField = async (root: ReactTestInstance, title: string, value: string) => {
  await act(async () => fieldByTitle(root, title).props.onChange(value));
};

test("employee creation requires an entered password and matching confirmation", async () => {
  assert.equal(EMPTY_EMPLOYEE_FORM.password, "");
  assert.equal(EMPTY_EMPLOYEE_FORM.passwordConfirmation, "");

  const validDetails = {
    ...EMPTY_EMPLOYEE_FORM,
    name: "Rina Example",
    email: "rina@example.com",
    phone: "0500000000",
  };
  assert.equal(canSubmitEmployeeForm(validDetails), false);
  assert.equal(
    canSubmitEmployeeForm({
      ...validDetails,
      password: "Different123!",
      passwordConfirmation: "Wrong123!",
    }),
    false,
  );
  assert.equal(
    canSubmitEmployeeForm({
      ...validDetails,
      password: "Different123!",
      passwordConfirmation: "Different123!",
    }),
    true,
  );

  const renderer = await renderComponent(
    <QueryClientProvider client={queryClient}>
      <AddEmployeeCard />
    </QueryClientProvider>,
  );
  try {
    const password = fieldByTitle(renderer.root, EMPLOYEES_COPY.PASSWORD_LABEL);
    const confirmation = fieldByTitle(renderer.root, EMPLOYEES_COPY.PASSWORD_CONFIRMATION_LABEL);
    const submit = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === EMPLOYEES_COPY.ADD_BUTTON);
    assert.ok(submit);
    assert.equal(password.props.value, "");
    assert.equal(confirmation.props.value, "");
    assert.equal(password.props.isRequired, true);
    assert.equal(confirmation.props.isRequired, true);
    assert.equal(password.props.isLtr, true);
    assert.equal(submit.props.disabled, true);
    assert.ok(JSON.stringify(renderer.toJSON()).includes(EMPLOYEES_COPY.PASSWORD_SHARE_HINT));
  } finally {
    await act(async () => renderer.unmount());
    queryClient.clear();
  }
});

test("password change retains fields on wrong-current error and signs out on success", async () => {
  const authenticatedSession = {
    accessToken: "password-change-test-token",
    user: {
      id: "password-change-test-user",
      email: "user@example.invalid",
      phone: "0500000000",
      firstName: "Test",
      lastName: "User",
      role: USER_ROLES.SYSTEM_ADMIN,
      assignedRoles: [USER_ROLES.SYSTEM_ADMIN],
      employeeNumber: "EMP-1",
      deletedAt: null,
      permissions: [],
    },
  };
  setSession(authenticatedSession);
  assert.deepEqual(getSession(), authenticatedSession);
  const originalUpdate = userService.updateMyPassword;
  const requests: Parameters<typeof userService.updateMyPassword>[] = [];
  const wrongCurrent = new AxiosError("wrong password", AxiosError.ERR_BAD_REQUEST, null, null, {
    status: HTTP_STATUS.BAD_REQUEST,
    statusText: "Bad Request",
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
    data: { code: API_ERROR_CODES.INVALID_CURRENT_PASSWORD },
  });
  userService.updateMyPassword = async payload => {
    requests.push([payload]);
    if (requests.length === 1) {
      throw wrongCurrent;
    }
  };

  const renderer = await renderComponent(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[ROUTE_PATHS.SETTINGS]}>
        <Routes>
          <Route element={<PasswordCard />} path={ROUTE_PATHS.SETTINGS} />
          <Route element={<LoginPage />} path={ROUTE_PATHS.LOGIN} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  try {
    const getSubmit = () =>
      renderer.root
        .findAllByType(Button)
        .find(button => button.props.text === SETTINGS_COPY.UPDATE_PASSWORD);
    assert.equal(getSubmit()?.props.disabled, true);
    await enterField(renderer.root, SETTINGS_COPY.CURRENT_PASSWORD, "short");
    await enterField(renderer.root, SETTINGS_COPY.NEW_PASSWORD, "Different123!");
    await enterField(renderer.root, SETTINGS_COPY.CONFIRM_PASSWORD, "Different123!");
    assert.equal(getSubmit()?.props.disabled, false);
    assert.equal(
      fieldByTitle(renderer.root, SETTINGS_COPY.CURRENT_PASSWORD).props.validator("short").isValid,
      true,
    );

    await act(async () => {
      getSubmit()?.props.onClick();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.deepEqual(requests, [[{ currentPassword: "short", password: "Different123!" }]]);
    assert.equal(
      renderer.root.findByType(InlineError).props.message,
      SETTINGS_COPY.CURRENT_PASSWORD_INCORRECT,
    );
    assert.equal(
      fieldByTitle(renderer.root, SETTINGS_COPY.CURRENT_PASSWORD).props.value,
      "short",
    );
    assert.equal(
      fieldByTitle(renderer.root, SETTINGS_COPY.NEW_PASSWORD).props.value,
      "Different123!",
    );
    assert.deepEqual(getSession(), authenticatedSession);

    await enterField(renderer.root, SETTINGS_COPY.CURRENT_PASSWORD, "correct-password");
    await act(async () => {
      getSubmit()?.props.onClick();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.deepEqual(requests[1], [
      { currentPassword: "correct-password", password: "Different123!" },
    ]);
    assert.equal(getSession(), null);
    assert.equal(renderer.root.findAllByType(PasswordCard).length, 0);
    assert.equal(
      renderer.root.findByType(NoticeBanner).props.title,
      LOGIN_COPY.PASSWORD_CHANGED_SIGN_IN_AGAIN,
    );
  } finally {
    await act(async () => renderer.unmount());
    userService.updateMyPassword = originalUpdate;
    setSession(null);
    queryClient.clear();
  }
});
