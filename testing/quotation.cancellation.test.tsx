import {
  QUOTATION_STATUS,
  QUOTATION_COMMAND,
  QUOTATION_QUERY_KEY,
  QUOTATION_COUNTS_KEY,
  QUOTATION_DETAIL_KEY,
  QUOTATION_CONFIRMATION,
} from "../src/constants/quotation.constant";

import {
  QUOTATION_AUTOSAVE_MS,
  QUOTATION_LIFECYCLE_COPY,
  QUOTATION_LIFECYCLE_ACTION,
} from "../src/constants/quotation.constant";

import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import { quotationFixture } from "./quotation.fixture";
import { setSession } from "../src/store/session.store";
import { logger } from "../src/utilities/logger.utility";
import { TextField as MuiTextField } from "@mui/material";
import { AxiosError, type AxiosRequestConfig } from "axios";
import { setTimeout as settle } from "node:timers/promises";
import { TIME_UNITS } from "../src/constants/time.constant";
import { HTTP_STATUS } from "../src/constants/api.constant";
import TextField from "../src/components/TextField/TextField";
import { API_ENDPOINTS } from "../src/constants/api.constant";
import FieldLabel from "../src/components/FieldLabel/FieldLabel";
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
import { MAX_QUOTATION_CANCELLATION_REASON_LENGTH } from "../src/constants/quotation.constant";
import type { IQuotationDocumentContext } from "../src/interfaces/quotation-document.interface";
import ValidationMessageText from "../src/components/ValidationMessageText/ValidationMessageText";

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

const documentContext = (quotation: IQuotation): IQuotationDocumentContext => {
  const party = { name: "Customer", address: null, city: null, email: null, phone: null };
  return {
    title: quotation.status === QUOTATION_STATUS.APPROVED ? "הזמנה" : "הצעת מחיר",
    printDate: quotation.date,
    issuerName: "Engineer",
    company: { ...party, name: "GENAIR", businessNumber: "1234", vatFileNumber: "9876" },
    recipient: { ...party, customerNumber: null },
    recipientContext: {
      customerId: quotation.customerId,
      projectId: quotation.projectId,
      salesAgentId: quotation.salesAgentId,
    },
    project: { name: null, address: null },
    metadata: {
      validUntil: null,
      customerTaxId: null,
      customerTaxLabel: "מספר",
      vatFileNumber: "9876",
      salesAgent: null,
    },
    terms: { approval: "אישור", general: [], delivery: [], warranty: [], additional: [] },
    defaultPayment: [],
    paymentTermLabels: {},
  };
};

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
  const get = httpClient.get.bind(httpClient);
  const preview = mock.method(
    httpClient,
    "get",
    async (url: string, config?: AxiosRequestConfig) => {
      if (url === `${API_ENDPOINTS.quotationById(initial.id)}/document-preview`) {
        const saved = client.getQueryData<IQuotation>(QUOTATION_DETAIL_KEY(initial.id)) ?? initial;
        return { data: documentContext(saved) };
      }
      return get(url, config);
    },
  );
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
    popup: (): ReturnType<typeof root> =>
      root()
        .findAllByType(GenericPopup)
        .find((candidate): boolean => candidate.props.open) ?? root().findByType(GenericPopup),
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
      preview.mock.restore();
      setSession(null);
    },
  };
};

test("cancellation and restoration require active authorized roles", () => {
  assert.equal(canCancelQuotation(null), false);
  assert.equal(canRestoreQuotation(null), false);
  assert.equal(canCancelQuotation(authorizedUser([])), false);
  for (const role of [USER_ROLES.ENGINEER, USER_ROLES.ENGINEERING_LEAD, USER_ROLES.SYSTEM_ADMIN]) {
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
        const permitted =
          role === USER_ROLES.ENGINEER ||
          role === USER_ROLES.ENGINEERING_LEAD ||
          role === USER_ROLES.SYSTEM_ADMIN;
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
          .findAllByType(TextField)
          .find((node): boolean => node.props.isRequired)
          ?.props.onChange("Project withdrawn");
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
]) {
  for (const action of [QUOTATION_CONFIRMATION.CANCEL, QUOTATION_CONFIRMATION.RESTORE]) {
    test(`${action} ${failureName} failure retains the confirmation and quotation; reload and explicit reconfirmation succeeds`, async () => {
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
      const get = mock.method(quotationService, "get", async (): Promise<IQuotation> => initial);
      const view = await mountQuotation(initial, authorizedUser([USER_ROLES.SYSTEM_ADMIN]));
      const actionText = isCancel ? "ביטול הצעה" : "שחזור הצעה";
      const attempt = { promise: null as Promise<void> | null };
      try {
        await act(async () => view.requiredButton(actionText).click());
        if (isCancel) {
          await act(async () => {
            view
              .root()
              .findAllByType(TextField)
              .find((node): boolean => node.props.isRequired)
              ?.props.onChange("Project withdrawn");
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
              .findAllByType(TextField)
              .find((node): boolean => node.props.isRequired)?.props.value,
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
            .some((alert): boolean =>
              alert
                .findAllByType(ValidationMessageText)
                .some((message): boolean => message.props.text === getApiErrorMessage(failure)),
            ),
        );
        post.mock.mockImplementation(async () => ({ data: next }));
        await act(async () => view.requiredButton("טען גרסה עדכנית").click());
        assert.equal(post.mock.callCount(), 1);
        if (failureName === "forbidden") {
          assert.equal(view.popup().props.buttons.primary.isDisabled, true);
          assert.ok(
            view
              .popup()
              .findAllByType(ValidationMessageText)
              .some((node): boolean => node.props.text === QUOTATION_LIFECYCLE_COPY.FORBIDDEN),
          );
          assert.equal(view.popup().props.buttons.secondary.isDisabled, false);
          assert.equal(post.mock.callCount(), 1);
          return;
        }
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
        get.mock.restore();
        await view.dispose();
      }
    });
  }
}

for (const action of [QUOTATION_CONFIRMATION.CANCEL, QUOTATION_CONFIRMATION.RESTORE]) {
  test(`${action} reloads the latest quotation after a real version conflict before retry`, async () => {
    const base = { ...quotationFixture(), status: QUOTATION_STATUS.REVIEW };
    const cancelled = cancelledQuotation(base);
    const isCancel = action === QUOTATION_CONFIRMATION.CANCEL;
    const initial = isCancel ? base : cancelled;
    const latest = { ...initial, version: initial.version + 1 };
    const next = isCancel
      ? cancelledQuotation(latest)
      : {
          ...base,
          version: latest.version + 1,
          cancellationHistory: latest.cancellationHistory.map(record => ({
            ...record,
            restoredAt: "2026-11-10T13:00:00.000Z",
            restoredById: "cancellation-user",
            restoredByName: "Rina Levy",
          })),
        };
    const conflict = Object.assign(new AxiosError("stale quotation"), {
      response: { status: HTTP_STATUS.CONFLICT, data: { message: "version changed" } },
    });
    const post = mock.method(
      httpClient,
      "post",
      async (_endpoint: string, body: { version: number }) => {
        if (body.version === initial.version) {
          throw conflict;
        }
        return { data: next };
      },
    );
    const get = mock.method(quotationService, "get", async () => latest);
    const view = await mountQuotation(initial, authorizedUser([USER_ROLES.SYSTEM_ADMIN]));
    const actionText = isCancel ? "ביטול הצעה" : "שחזור הצעה";
    try {
      await act(async () => view.requiredButton(actionText).click());
      if (isCancel) {
        await act(async () => {
          view
            .root()
            .findAllByType(TextField)
            .find((node): boolean => node.props.isRequired)
            ?.props.onChange("Project withdrawn");
        });
      }

      await act(async () => view.popup().props.buttons.primary.onClick());
      assert.equal(view.popup().props.open, true);
      assert.deepEqual(view.quotation(), initial);
      assert.equal(view.popup().props.buttons.primary.isDisabled, true);
      assert.ok(view.requiredButton("טען גרסה עדכנית"));
      await act(async () => view.requiredButton("טען גרסה עדכנית").click());
      assert.equal(get.mock.callCount(), 1);
      assert.deepEqual(view.quotation(), latest);
      assert.equal(view.popup().props.open, true);
      assert.equal(view.popup().props.buttons.primary.isDisabled, false);
      assert.ok(view.root().findAllByProps({ role: "status" }).length > 0);
      await act(async () => view.popup().props.onClose());
      assert.equal(view.popup().props.open, false);
      await act(async () => view.requiredButton(actionText).click());
      assert.equal(view.popup().props.open, true);
      if (isCancel) {
        assert.equal(
          view
            .root()
            .findAllByType(TextField)
            .find((node): boolean => node.props.isRequired)?.props.value,
          "Project withdrawn",
        );
      }

      await act(async () => view.popup().props.buttons.primary.onClick());
      assert.equal(post.mock.callCount(), 2);
      assert.deepEqual(
        post.mock.calls[0].arguments[1],
        isCancel
          ? { version: initial.version, reason: "Project withdrawn" }
          : { version: initial.version },
      );
      assert.deepEqual(
        post.mock.calls[1].arguments[1],
        isCancel
          ? { version: latest.version, reason: "Project withdrawn" }
          : { version: latest.version },
      );
      assert.equal(view.popup().props.open, false);
      assert.deepEqual(view.quotation(), next);
    } finally {
      post.mock.restore();
      get.mock.restore();
      await view.dispose();
    }
  });
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

for (const status of [QUOTATION_STATUS.REVIEW, QUOTATION_STATUS.APPROVED]) {
  test(`reasonless return from ${status} confirms separately and serializes lifecycle commands`, async (): Promise<void> => {
    const initial = { ...quotationFixture(), status };
    const user = authorizedUser([USER_ROLES.ENGINEERING_LEAD]);
    const approvedUser = {
      ...user,
      permissions: [...user.permissions, PERMISSIONS.QUOTATIONS_APPROVE],
    };
    const next = { ...initial, status: QUOTATION_STATUS.DRAFT, version: initial.version + 1 };
    const gate = Promise.withResolvers<IQuotation>();
    const transition = mock.method(
      quotationService,
      "transition",
      (): Promise<IQuotation> => gate.promise,
    );
    const cancel = mock.method(quotationService, "cancel", async (): Promise<IQuotation> => next);
    const view = await mountQuotation(initial, approvedUser);
    const pending = { promise: null as Promise<void> | null };
    try {
      await act(async (): Promise<void> => {
        await view.requiredButton("החזרה לעריכה").click();
      });
      assert.equal(view.popup().props.title, "החזרה לעריכה");
      assert.equal(view.popup().findAllByType("textarea").length, 0);
      assert.equal(transition.mock.callCount(), 0);
      await act(async (): Promise<void> => {
        pending.promise = view.popup().props.buttons.primary.onClick();
      });
      assert.equal(view.popup().props.closeDisabled, true);
      assert.equal(
        view.requiredButton("ביטול " + (status === QUOTATION_STATUS.APPROVED ? "הזמנה" : "הצעה"))
          .disabled,
        true,
      );
      await act(async (): Promise<void> => {
        await view.popup().props.buttons.primary.onClick();
      });
      assert.equal(transition.mock.callCount(), 1);
      assert.equal(cancel.mock.callCount(), 0);
      await act(async (): Promise<void> => {
        gate.resolve(next);
        await pending.promise;
      });
      assert.equal(view.quotation().status, QUOTATION_STATUS.DRAFT);
      assert.equal(view.popup().props.open, false);
      assert.deepEqual(transition.mock.calls[0].arguments, [initial, QUOTATION_STATUS.DRAFT]);
    } finally {
      transition.mock.restore();
      cancel.mock.restore();
      await view.dispose();
    }
  });
}

test("review return and reasoned rejection share the assigned lead authorization boundary", async (): Promise<void> => {
  const initial = { ...quotationFixture(), status: QUOTATION_STATUS.REVIEW };
  const user = authorizedUser([USER_ROLES.ENGINEER]);
  const view = await mountQuotation(initial, {
    ...user,
    permissions: [...user.permissions, PERMISSIONS.QUOTATIONS_APPROVE],
  });
  try {
    assert.equal(view.button("החזרה לעריכה"), null);
    assert.equal(view.button("דחייה עם סיבה"), null);
    assert.ok(view.button("אישור ההצעה"));
  } finally {
    await view.dispose();
  }
});

test("reasoned rejection requires a reason and permits correcting deterministic validation without reload", async (): Promise<void> => {
  const initial = { ...quotationFixture(), status: QUOTATION_STATUS.REVIEW };
  const user = authorizedUser([USER_ROLES.ENGINEERING_LEAD]);
  const view = await mountQuotation(initial, {
    ...user,
    permissions: [...user.permissions, PERMISSIONS.QUOTATIONS_APPROVE],
  });
  const failure = Object.assign(new AxiosError("validation"), {
    response: { status: HTTP_STATUS.BAD_REQUEST, data: { message: "Invalid reason" } },
  });
  const reject = mock.method(quotationService, "reject", async (): Promise<IQuotation> => {
    throw failure;
  });
  const get = mock.method(quotationService, "get", async (): Promise<IQuotation> => initial);
  const commandLog = mock.method(logger, "error", (): void => {});
  try {
    await act(async (): Promise<void> => {
      await view.requiredButton("דחייה עם סיבה").click();
    });
    assert.equal(view.popup().props.title, "דחיית הצעה והחזרה לתיקון");
    assert.equal(view.popup().props.buttons.primary.isDisabled, true);
    const field = (): ReturnType<typeof view.root> => view.popup().findByType(TextField);
    await act(async (): Promise<void> => {
      field().props.onChange("First reason");
    });
    await act(async (): Promise<void> => {
      await view.popup().props.buttons.primary.onClick();
    });
    assert.equal(field().props.value, "First reason");
    assert.equal(view.popup().props.buttons.primary.isDisabled, true);
    await act(async (): Promise<void> => {
      field().props.onChange("Corrected reason");
    });
    assert.equal(view.popup().props.buttons.primary.isDisabled, false);
    assert.equal(get.mock.callCount(), 0);
    reject.mock.mockImplementation(async (): Promise<IQuotation> => ({
      ...initial,
      status: QUOTATION_STATUS.DRAFT,
      version: initial.version + 1,
    }));
    await act(async (): Promise<void> => {
      await view.popup().props.buttons.primary.onClick();
    });
    assert.equal(reject.mock.callCount(), 2);
    assert.deepEqual(reject.mock.calls[1].arguments, [initial, "Corrected reason"]);
    assert.equal(view.popup().props.open, false);
  } finally {
    reject.mock.restore();
    get.mock.restore();
    commandLog.mock.restore();
    await view.dispose();
  }
});

test("uncertain outcome remains visibly blocked after closing, editing and autosaving until authoritative reload and explicit reconfirmation", async (): Promise<void> => {
  const initial = { ...quotationFixture(), status: QUOTATION_STATUS.REVIEW };
  const user = authorizedUser([USER_ROLES.ENGINEERING_LEAD]);
  const latest = {
    ...initial,
    internalNotes: "Edited after failure",
    version: initial.version + 1,
  };
  const next = { ...latest, status: QUOTATION_STATUS.DRAFT, version: latest.version + 1 };
  const transition = mock.method(quotationService, "transition", async (): Promise<IQuotation> => {
    throw new Error("uncertain outcome");
  });
  const save = mock.method(quotationService, "save", async (): Promise<IQuotation> => latest);
  const get = mock.method(quotationService, "get", async (): Promise<IQuotation> => latest);
  const commandLog = mock.method(logger, "error", (): void => {});
  const view = await mountQuotation(initial, {
    ...user,
    permissions: [...user.permissions, PERMISSIONS.QUOTATIONS_APPROVE],
  });
  try {
    await act(async (): Promise<void> => {
      await view.requiredButton("החזרה לעריכה").click();
    });
    await act(async (): Promise<void> => {
      await view.popup().props.buttons.primary.onClick();
    });
    await act(async (): Promise<void> => {
      view.popup().props.onClose();
    });
    await act(async (): Promise<void> => {
      view
        .root()
        .findByType(QuotationSummary)
        .props.onChange({ ...initial, internalNotes: latest.internalNotes });
    });
    await act(async (): Promise<void> => {
      await settle(QUOTATION_AUTOSAVE_MS + TIME_UNITS.SECOND_MS);
    });
    assert.equal(save.mock.callCount(), 1);
    assert.equal(view.requiredButton("החזרה לעריכה").disabled, true);
    assert.ok(
      view
        .root()
        .findAllByType(ValidationMessageText)
        .some((node): boolean => node.props.text === QUOTATION_LIFECYCLE_COPY.RELOAD_REQUIRED),
    );
    assert.equal(transition.mock.callCount(), 1);
    await act(async (): Promise<void> => {
      await view.requiredButton("טען גרסה עדכנית").click();
    });
    assert.equal(get.mock.callCount(), 1);
    assert.equal(transition.mock.callCount(), 1);
    assert.equal(view.requiredButton("החזרה לעריכה").disabled, false);
    transition.mock.mockImplementation(async (): Promise<IQuotation> => next);
    await act(async (): Promise<void> => {
      await view.requiredButton("החזרה לעריכה").click();
    });
    assert.equal(transition.mock.callCount(), 1);
    await act(async (): Promise<void> => {
      await view.popup().props.buttons.primary.onClick();
    });
    assert.deepEqual(transition.mock.calls[1].arguments, [latest, QUOTATION_STATUS.DRAFT]);
  } finally {
    transition.mock.restore();
    save.mock.restore();
    get.mock.restore();
    commandLog.mock.restore();
    await view.dispose();
  }
});

for (const responseStatus of [HTTP_STATUS.CONFLICT, HTTP_STATUS.FORBIDDEN]) {
  for (const action of [QUOTATION_LIFECYCLE_ACTION.RETURN, QUOTATION_LIFECYCLE_ACTION.REJECT]) {
    test(`${action} explains unavailable action inside its dialog after ${responseStatus} reload`, async (): Promise<void> => {
      const initial = { ...quotationFixture(), status: QUOTATION_STATUS.REVIEW };
      const user = authorizedUser([USER_ROLES.ENGINEERING_LEAD]);
      const latest = cancelledQuotation(initial);
      const failure = Object.assign(new AxiosError("conflict"), {
        response: { status: responseStatus, data: { message: "source changed" } },
      });
      const transition = mock.method(
        quotationService,
        "transition",
        async (): Promise<IQuotation> => {
          throw failure;
        },
      );
      const reject = mock.method(quotationService, "reject", async (): Promise<IQuotation> => {
        throw failure;
      });
      const get = mock.method(quotationService, "get", async (): Promise<IQuotation> => latest);
      const commandLog = mock.method(logger, "error", (): void => {});
      const view = await mountQuotation(initial, {
        ...user,
        permissions: [...user.permissions, PERMISSIONS.QUOTATIONS_APPROVE],
      });
      const expectedExplanation =
        responseStatus === HTTP_STATUS.FORBIDDEN
          ? QUOTATION_LIFECYCLE_COPY.FORBIDDEN
          : QUOTATION_LIFECYCLE_COPY.SOURCE_CHANGED;
      const actionLabel =
        action === QUOTATION_LIFECYCLE_ACTION.RETURN ? "החזרה לעריכה" : "דחייה עם סיבה";
      try {
        await act(async (): Promise<void> => {
          await view.requiredButton(actionLabel).click();
        });
        if (action === QUOTATION_LIFECYCLE_ACTION.REJECT) {
          await act(async (): Promise<void> => {
            view.popup().findByType(TextField).props.onChange("Keep this reason");
          });
        }
        await act(async (): Promise<void> => {
          await view.popup().props.buttons.primary.onClick();
        });
        await act(async (): Promise<void> => {
          await view.requiredButton("טען גרסה עדכנית").click();
        });
        assert.equal(view.popup().props.buttons.primary.isDisabled, true);
        assert.ok(
          view
            .popup()
            .findAllByType(ValidationMessageText)
            .some((node): boolean => node.props.text === expectedExplanation),
        );
        assert.ok(
          view
            .popup()
            .findAllByType(QuotationButton)
            .some((node): boolean => node.props.text === "טען פרטי מסמך מחדש"),
        );
        assert.equal(view.popup().props.buttons.secondary.isDisabled, false);
        if (action === QUOTATION_LIFECYCLE_ACTION.REJECT) {
          assert.equal(view.popup().findByType(TextField).props.value, "Keep this reason");
        }
        assert.equal(transition.mock.callCount() + reject.mock.callCount(), 1);
      } finally {
        transition.mock.restore();
        reject.mock.restore();
        get.mock.restore();
        commandLog.mock.restore();
        await view.dispose();
      }
    });
  }
}

const REASON_VALIDATION_SCENARIOS = {
  MULTILINGUAL: {
    value: "נדרש תיקון AC123: 24,000 BTU, מחיר 12.50 ₪! (בדיקה)\n".repeat(15),
    valid: true,
    error: "",
  },
  MAXIMUM: { value: "א".repeat(MAX_QUOTATION_CANCELLATION_REASON_LENGTH), valid: true, error: "" },
  EMPTY: { value: "   ", valid: false, error: QUOTATION_LIFECYCLE_COPY.REASON_REQUIRED },
  TOO_LONG: {
    value: "א".repeat(MAX_QUOTATION_CANCELLATION_REASON_LENGTH + 1),
    valid: false,
    error: QUOTATION_LIFECYCLE_COPY.REASON_TOO_LONG,
  },
} as const;

for (const action of [QUOTATION_LIFECYCLE_ACTION.CANCEL, QUOTATION_LIFECYCLE_ACTION.REJECT]) {
  test(`${action} free reason validation accepts long multilingual punctuation and blocks empty or oversized input consistently`, async (): Promise<void> => {
    const initial = { ...quotationFixture(), status: QUOTATION_STATUS.REVIEW };
    const user = authorizedUser([USER_ROLES.ENGINEERING_LEAD]);
    const view = await mountQuotation(initial, {
      ...user,
      permissions: [...user.permissions, PERMISSIONS.QUOTATIONS_APPROVE],
    });
    const actionLabel =
      action === QUOTATION_LIFECYCLE_ACTION.CANCEL ? "ביטול הצעה" : "דחייה עם סיבה";
    try {
      await act(async (): Promise<void> => {
        await view.requiredButton(actionLabel).click();
      });
      for (const scenario of Object.values(REASON_VALIDATION_SCENARIOS)) {
        await act(async (): Promise<void> => {
          view.popup().findByType(TextField).props.onChange(scenario.value);
        });
        const field = view.popup().findByType(TextField);
        assert.equal(field.props.value, scenario.value);
        assert.equal(field.props.validator(scenario.value).isValid, scenario.valid);
        assert.equal(field.findByType(MuiTextField).props.helperText, scenario.error);
        assert.equal(field.findByType(FieldLabel).props.hasError, !scenario.valid);
        assert.equal(field.props.maxLength, MAX_QUOTATION_CANCELLATION_REASON_LENGTH);
        assert.equal(view.popup().props.buttons.primary.isDisabled, !scenario.valid);
      }
    } finally {
      await view.dispose();
    }
  });
}
