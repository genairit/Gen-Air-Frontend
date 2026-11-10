import {
  QUOTATION_STATUS,
  QUOTATION_COMMAND,
  QUOTATION_QUERY_KEY,
  QUOTATION_COUNTS_KEY,
  QUOTATION_DETAIL_KEY,
  QUOTATION_CONFIRMATION,
} from "../src/constants/quotation.constant";

import { AxiosError } from "axios";
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import { quotationFixture } from "./quotation.fixture";
import { setSession } from "../src/store/session.store";
import { logger } from "../src/utilities/logger.utility";
import { HTTP_STATUS } from "../src/constants/api.constant";
import { API_ENDPOINTS } from "../src/constants/api.constant";
import { httpClient } from "../src/services/http-client.service";
import QuotationPage from "../src/pages/quotations/QuotationPage";
import { PERMISSIONS } from "../src/constants/permission.constant";
import { customerService } from "../src/services/customer.service";
import { quotationService } from "../src/services/quotation.service";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import GenericPopup from "../src/components/GenericPopup/GenericPopup";
import { getApiErrorMessage } from "../src/utilities/api-error.utility";
import type { UserRoleType } from "../src/constants/user-role.constant";
import type { IQuotation } from "../src/interfaces/quotation.interface";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { IApiAuthorizedUser } from "../src/interfaces/api.interface";
import QuotationButton from "../src/pages/quotations/components/QuotationButton";
import { USER_ROLES, USER_ROLE_VALUES } from "../src/constants/user-role.constant";
import QuotationSummary from "../src/pages/quotations/components/QuotationSummary";
import type { TQuotationRestorableStatus } from "../src/constants/quotation.constant";
import { canCancelQuotation, canRestoreQuotation } from "../src/utilities/permission.utility";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
Reflect.set(globalThis, "window", new EventTarget());

interface IQuotationButtonControl {
  disabled: boolean;
  click: () => void | Promise<void>;
}

const authorizedUser = (roles: UserRoleType[]): IApiAuthorizedUser => ({
  id: "cancellation-user",
  email: "",
  phone: "",
  lastName: "",
  firstName: "",
  employeeNumber: "",
  deletedAt: null,
  role: roles[0] ?? USER_ROLES.SECRETARY,
  assignedRoles: roles,
  permissions: [PERMISSIONS.QUOTATIONS_UPDATE],
});

const cancelledQuotation = (initial: IQuotation): IQuotation => ({
  ...initial,
  version: initial.version + 1,
  status: QUOTATION_STATUS.CANCELLED,
  cancelledFromStatus: initial.status as TQuotationRestorableStatus,
  cancellationHistory: [
    ...initial.cancellationHistory,
    {
      kind: "manual",
      fromStatus: initial.status as TQuotationRestorableStatus,
      cancelledAt: "2026-11-10T12:00:00.000Z",
      cancelledById: "cancellation-user",
      cancelledByName: "Dana Cohen",
      reason: "Project withdrawn",
      restoredAt: null,
      restoredById: null,
      restoredByName: null,
    },
  ],
});

const mountQuotation = async (initial: IQuotation, user: IApiAuthorizedUser | null) => {
  setSession(user === null ? null : { user, accessToken: "cancellation-test-token" });
  const customers = mock.method(customerService, "getByFilter", async () => []);
  const customer = mock.method(customerService, "getById", async () => ({
    id: initial.customerId,
    name: "Customer",
  }));
  const projects = mock.method(quotationService, "projectChoices", async () => []);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime: Infinity } },
  });
  client.setQueryData(QUOTATION_DETAIL_KEY(initial.id), initial);
  client.setQueryData(QUOTATION_QUERY_KEY, [initial]);
  client.setQueryData(QUOTATION_COUNTS_KEY, {});
  const router = createMemoryRouter(
    [
      {
        path: "/quotations/:quotationId",
        element: (
          <QueryClientProvider client={client}>
            <QuotationPage />
          </QueryClientProvider>
        ),
      },
    ],
    { initialEntries: [`/quotations/${initial.id}`] },
  );
  const state = { renderer: null as ReturnType<typeof create> | null };
  await act(async () => {
    state.renderer = create(<RouterProvider router={router} />);
  });
  const root = () => {
    assert.ok(state.renderer);
    return state.renderer.root;
  };
  const button = (text: string): IQuotationButtonControl | null => {
    const node = root()
      .findAllByType(QuotationButton)
      .find(candidate => candidate.props.text === text);

    if (node == null || typeof node.props.onClick !== "function") {
      return null;
    }

    return {
      disabled: node.props.disabled === true,
      click: () => node.props.onClick(),
    };
  };
  const requiredButton = (text: string): IQuotationButtonControl => {
    const foundButton = button(text);

    if (foundButton === null) {
      throw new Error(`Expected quotation button "${text}" to be rendered.`);
    }

    return foundButton;
  };
  return {
    client,
    root,
    popup: () => root().findByType(GenericPopup),
    button,
    requiredButton,
    quotation: (): IQuotation => root().findByType(QuotationSummary).props.quotation,
    dispose: async () => {
      await act(async () => {
        state.renderer?.unmount();
      });
      router.dispose();
      client.clear();
      customers.mock.restore();
      customer.mock.restore();
      projects.mock.restore();
      setSession(null);
    },
  };
};

test("cancellation and restoration require active authorized roles", () => {
  assert.equal(canCancelQuotation(null), false);
  assert.equal(canRestoreQuotation(null), false);
  assert.equal(canCancelQuotation(authorizedUser([])), false);
  for (const role of [USER_ROLES.ENGINEER, USER_ROLES.SYSTEM_ADMIN]) {
    const user = authorizedUser([role, USER_ROLES.FINANCE]);
    assert.equal(canCancelQuotation(user), true);
    assert.equal(canRestoreQuotation(user), role === USER_ROLES.SYSTEM_ADMIN);
    assert.equal(canCancelQuotation({ ...user, permissions: [] }), false);
    assert.equal(canRestoreQuotation({ ...user, permissions: [] }), false);
    assert.equal(canCancelQuotation({ ...user, role: USER_ROLES.FINANCE }), false);
    assert.equal(canRestoreQuotation({ ...user, role: USER_ROLES.FINANCE }), false);
  }
});

for (const role of USER_ROLE_VALUES) {
  for (const status of [QUOTATION_STATUS.REVIEW, QUOTATION_STATUS.CANCELLED]) {
    test(`${role} sees only the permitted ${status} cancellation action`, async () => {
      const base = { ...quotationFixture(), status };
      const view = await mountQuotation(base, authorizedUser([role]));
      try {
        const permitted = role === USER_ROLES.ENGINEER || role === USER_ROLES.SYSTEM_ADMIN;
        const canCancel = permitted && status !== QUOTATION_STATUS.CANCELLED;
        const canRestore =
          role === USER_ROLES.SYSTEM_ADMIN && status === QUOTATION_STATUS.CANCELLED;
        assert.equal(view.button("ביטול הצעה") != null, canCancel);
        assert.equal(view.button("שחזור הצעה") != null, canRestore);
        assert.equal(view.popup().props.open, false);
      } finally {
        await view.dispose();
      }
    });
  }
}

for (const user of [
  null,
  authorizedUser([]),
  { ...authorizedUser([USER_ROLES.ENGINEER]), permissions: [] },
]) {
  test(`missing cancellation authority hides controls (${user?.assignedRoles.join(",") ?? "guest"})`, async () => {
    const view = await mountQuotation(quotationFixture(), user);
    try {
      assert.equal(view.button("ביטול הצעה"), null);
      assert.equal(view.button("שחזור הצעה"), null);
    } finally {
      await view.dispose();
    }
  });
}

const restorableStatuses: TQuotationRestorableStatus[] = [
  QUOTATION_STATUS.DRAFT,
  QUOTATION_STATUS.REVIEW,
  QUOTATION_STATUS.APPROVED,
];
for (const status of restorableStatuses) {
  test(`cancel/restore confirmations preserve ${status} until accepted and refresh caches`, async () => {
    const noun = status === QUOTATION_STATUS.APPROVED ? "הזמנה" : "הצעה";
    const initial = { ...quotationFixture(), status };
    const cancelled = { ...cancelledQuotation(initial), cancelledFromStatus: status };
    const restored = {
      ...initial,
      version: cancelled.version + 1,
      cancellationHistory: cancelled.cancellationHistory.map(record => ({
        ...record,
        restoredAt: "2026-11-10T13:00:00.000Z",
        restoredById: "cancellation-user",
        restoredByName: "Rina Levy",
      })),
    };
    const responses = [cancelled, restored];
    const post = mock.method(httpClient, "post", async () => ({
      data: responses[post.mock.callCount()],
    }));
    const view = await mountQuotation(initial, authorizedUser([USER_ROLES.SYSTEM_ADMIN]));
    try {
      await act(async () => view.requiredButton(`ביטול ${noun}`).click());
      assert.equal(view.popup().props.title, `ביטול ${noun}`);
      assert.equal(view.popup().props.buttons.primary.isDisabled, true);
      assert.equal(post.mock.callCount(), 0);
      await act(async () => view.popup().props.buttons.secondary.onClick());
      assert.equal(view.popup().props.open, false);
      assert.equal(view.quotation().status, status);
      assert.equal(post.mock.callCount(), 0);

      await act(async () => view.requiredButton(`ביטול ${noun}`).click());
      await act(async () => {
        view
          .root()
          .findAllByType("textarea")
          .find(node => node.props.required)
          ?.props.onChange({ target: { value: "Project withdrawn" } });
      });
      assert.equal(view.popup().props.buttons.primary.isDisabled, false);
      await act(async () => view.popup().props.buttons.primary.onClick());
      assert.deepEqual(post.mock.calls[0].arguments, [
        API_ENDPOINTS.quotationCancel(initial.id),
        { version: initial.version, reason: "Project withdrawn" },
      ]);
      assert.equal(view.popup().props.open, false);
      assert.deepEqual(view.quotation(), cancelled);
      assert.equal(view.button(`ביטול ${noun}`), null);
      assert.ok(view.button(`שחזור ${noun}`));
      assert.deepEqual(view.client.getQueryData(QUOTATION_DETAIL_KEY(initial.id)), cancelled);
      assert.equal(view.client.getQueryState(QUOTATION_QUERY_KEY)?.isInvalidated, true);
      assert.equal(view.client.getQueryState(QUOTATION_COUNTS_KEY)?.isInvalidated, true);

      await act(async () => view.requiredButton(`שחזור ${noun}`).click());
      assert.equal(view.popup().props.title, `שחזור ${noun}`);
      await act(async () => view.popup().props.onClose());
      assert.equal(post.mock.callCount(), 1);
      assert.deepEqual(view.quotation(), cancelled);
      await act(async () => view.requiredButton(`שחזור ${noun}`).click());
      await act(async () => view.popup().props.buttons.primary.onClick());
      assert.deepEqual(post.mock.calls[1].arguments, [
        API_ENDPOINTS.quotationRestore(initial.id),
        { version: cancelled.version },
      ]);
      assert.equal(view.popup().props.open, false);
      assert.deepEqual(view.quotation(), restored);
      assert.deepEqual(view.client.getQueryData(QUOTATION_DETAIL_KEY(initial.id)), restored);
      assert.ok(view.button(`ביטול ${noun}`));
      assert.equal(view.button(`שחזור ${noun}`), null);
    } finally {
      post.mock.restore();
      await view.dispose();
    }
  });
}

for (const { failureName, failure } of [
  { failureName: "network", failure: new Error("offline") },
  {
    failureName: "forbidden",
    failure: Object.assign(new AxiosError("forbidden"), {
      response: { status: HTTP_STATUS.FORBIDDEN, data: { message: "permission changed" } },
    }),
  },
  {
    failureName: "conflict",
    failure: Object.assign(new AxiosError("conflict"), {
      response: { status: HTTP_STATUS.CONFLICT, data: { message: "version changed" } },
    }),
  },
]) {
  for (const action of [QUOTATION_CONFIRMATION.CANCEL, QUOTATION_CONFIRMATION.RESTORE]) {
    test(`${action} ${failureName} failure retains the confirmation and quotation; explicit retry succeeds`, async () => {
      const base = { ...quotationFixture(), status: QUOTATION_STATUS.REVIEW };
      const cancelled = cancelledQuotation(base);
      const isCancel = action === QUOTATION_CONFIRMATION.CANCEL;
      const initial = isCancel ? base : cancelled;
      const next = isCancel
        ? cancelled
        : {
            ...base,
            version: cancelled.version + 1,
            cancellationHistory: cancelled.cancellationHistory.map(record => ({
              ...record,
              restoredAt: "2026-11-10T13:00:00.000Z",
              restoredById: "cancellation-user",
              restoredByName: "Rina Levy",
            })),
          };
      const gate = Promise.withResolvers<{ data: IQuotation }>();
      const post = mock.method(httpClient, "post", () => gate.promise);
      const commandLog = mock.method(logger, "error", () => {});
      const view = await mountQuotation(initial, authorizedUser([USER_ROLES.SYSTEM_ADMIN]));
      const actionText = isCancel ? "ביטול הצעה" : "שחזור הצעה";
      const attempt = { promise: null as Promise<void> | null };
      try {
        await act(async () => view.requiredButton(actionText).click());
        if (isCancel) {
          await act(async () => {
            view
              .root()
              .findAllByType("textarea")
              .find(node => node.props.required)
              ?.props.onChange({ target: { value: "Project withdrawn" } });
          });
        }
        await act(async () => {
          attempt.promise = view.popup().props.buttons.primary.onClick();
        });
        assert.equal(view.popup().props.buttons.primary.isDisabled, true);
        assert.equal(view.requiredButton(actionText).disabled, true);
        assert.deepEqual(view.quotation(), initial);
        await act(async () => view.popup().props.buttons.primary.onClick());
        assert.equal(post.mock.callCount(), 1);
        await act(async () => {
          gate.reject(failure);
          await attempt.promise;
        });
        assert.equal(post.mock.callCount(), 1);
        const operation =
          action === QUOTATION_CONFIRMATION.CANCEL
            ? QUOTATION_COMMAND.CANCEL
            : QUOTATION_COMMAND.RESTORE;
        assert.deepEqual(commandLog.mock.calls[0]?.arguments[1], {
          quotationId: initial.id,
          operation,
          error: getApiErrorMessage(failure),
        });
        assert.equal(view.popup().props.open, true);
        assert.equal(view.popup().props.buttons.primary.isDisabled, true);
        if (isCancel) {
          assert.equal(
            view
              .root()
              .findAllByType("textarea")
              .find(node => node.props.required)?.props.value,
            "Project withdrawn",
          );
        }
        assert.deepEqual(view.quotation(), initial);
        assert.deepEqual(view.client.getQueryData(QUOTATION_DETAIL_KEY(initial.id)), initial);
        assert.equal(view.client.getQueryState(QUOTATION_QUERY_KEY)?.isInvalidated, false);
        assert.equal(view.client.getQueryState(QUOTATION_COUNTS_KEY)?.isInvalidated, false);
        assert.ok(
          view
            .root()
            .findAllByProps({ role: "alert" })
            .some(alert => alert.children.includes(getApiErrorMessage(failure))),
        );
        post.mock.mockImplementation(async () => ({ data: next }));
        await act(async () => view.requiredButton("אפשר ניסיון חוזר").click());
        assert.equal(post.mock.callCount(), 1);
        assert.equal(view.popup().props.buttons.primary.isDisabled, false);
        await act(async () => view.popup().props.buttons.primary.onClick());
        assert.equal(post.mock.callCount(), 2);
        assert.deepEqual(post.mock.calls[1].arguments, post.mock.calls[0].arguments);
        assert.equal(view.popup().props.open, false);
        assert.deepEqual(view.quotation(), next);
        assert.equal(view.root().findAllByProps({ role: "alert" }).length, 0);
      } finally {
        post.mock.restore();
        commandLog.mock.restore();
        await view.dispose();
      }
    });
  }
}

const orderApprover = () => ({
  ...authorizedUser([USER_ROLES.ENGINEER]),
  permissions: [PERMISSIONS.QUOTATIONS_UPDATE, PERMISSIONS.QUOTATIONS_APPROVE],
});

const reviewQuotationWithProject = (): IQuotation => ({
  ...quotationFixture(),
  status: QUOTATION_STATUS.REVIEW,
  projectId: "project1",
});

test("approving a quotation sends a status transition and updates caches", async () => {
  const initial = reviewQuotationWithProject();
  const approved = { ...initial, status: QUOTATION_STATUS.APPROVED, version: 2 };
  const post = mock.method(httpClient, "post", async () => ({ data: approved }));
  const view = await mountQuotation(initial, orderApprover());
  try {
    await act(async () => view.requiredButton("אישור ההצעה").click());
    assert.deepEqual(post.mock.calls[0]?.arguments, [
      API_ENDPOINTS.quotationReview(initial.id),
      { version: initial.version, status: QUOTATION_STATUS.APPROVED },
    ]);
    assert.equal(view.popup().props.open, false);
    assert.deepEqual(view.quotation(), approved);
    assert.deepEqual(view.client.getQueryData(QUOTATION_DETAIL_KEY(initial.id)), approved);
    assert.equal(view.client.getQueryState(QUOTATION_QUERY_KEY)?.isInvalidated, true);
    assert.equal(view.client.getQueryState(QUOTATION_COUNTS_KEY)?.isInvalidated, true);
  } finally {
    post.mock.restore();
    await view.dispose();
  }
});
