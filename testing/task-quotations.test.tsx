import {
  isTaskQuotationResult,
  isTaskQuotationContext,
} from "../src/utilities/guards/task-quotation.guard";

import {
  QUOTATION_EMAIL_STATUS,
  QUOTATION_EMAIL_STEP_ACTION_LABELS,
} from "../src/constants/quotation-execution-email.constant";

import { test, mock } from "node:test";
import assert from "node:assert/strict";
import type { ReactElement } from "react";
import { createTask } from "./project-tasks.fixture";
import Button from "../src/components/Button/Button";
import { quotationFixture } from "./quotation.fixture";
import { setSession } from "../src/store/session.store";
import CheckBox from "../src/components/CheckBox/CheckBox";
import BackLink from "../src/components/BackLink/BackLink";
import { taskService } from "../src/services/task.service";
import { queryClient } from "../src/providers/query-client";
import TaskView from "../src/pages/task/components/TaskView";
import TextField from "../src/components/TextField/TextField";
import { TASK_STATUSES } from "../src/constants/task.constant";
import { TASK_TYPES } from "../src/constants/task-type.constant";
import { httpClient } from "../src/services/http-client.service";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { customerService } from "../src/services/customer.service";
import InlineError from "../src/components/InlineError/InlineError";
import { quotationService } from "../src/services/quotation.service";
import { isQuotation } from "../src/utilities/guards/quotation.guard";
import Autocomplete from "../src/components/Autocomplete/Autocomplete";
import GenericPopup from "../src/components/GenericPopup/GenericPopup";
import TaskHeaderCard from "../src/pages/task/components/TaskHeaderCard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TaskQuotations from "../src/pages/task/components/TaskQuotations";
import { act, create, type ReactTestInstance } from "react-test-renderer";
import { orderTaskQuotations } from "../src/utilities/task-quotation.utility";
import { TASK_QUOTATION_KEYS } from "../src/constants/task-quotation.constant";
import QuotationEditor from "../src/pages/quotations/components/QuotationEditor";
import { projectActivityService } from "../src/services/project-activity.service";
import { MemoryRouter, createMemoryRouter, RouterProvider } from "react-router-dom";
import { QUOTATION_PROJECT_ROLE } from "../src/constants/quotation-sharing.constant";
import { PERMISSIONS, type PermissionType } from "../src/constants/permission.constant";
import type { ITaskQuotationContext } from "../src/interfaces/task-quotation.interface";
import QuotationProjectPicker from "../src/pages/quotations/components/QuotationProjectPicker";
import { AuthorizationContextChangedError } from "../src/managers/authorization-context.manager";
import QuotationCustomerPicker from "../src/pages/quotations/components/QuotationCustomerPicker";
import { quotationExecutionEmailService } from "../src/services/quotation-execution-email.service";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
Reflect.set(globalThis, "window", new EventTarget());

const authorize = (permissions: PermissionType[]) =>
  setSession({
    accessToken: "task-quotation-test",
    user: {
      id: "actor",
      email: "",
      phone: "",
      lastName: "",
      firstName: "",
      employeeNumber: "",
      deletedAt: null,
      role: USER_ROLES.SECRETARY,
      assignedRoles: [USER_ROLES.SECRETARY],
      permissions,
    },
  });
const reader = [PERMISSIONS.TASKS_READ, PERMISSIONS.QUOTATIONS_READ];
const creator = [...reader, PERMISSIONS.QUOTATIONS_CREATE];
const context = (changes: Partial<ITaskQuotationContext> = {}): ITaskQuotationContext => ({
  canCreate: true,
  projectId: "apartment",
  customerId: "customer",
  primaryQuotationId: null,
  quotations: [],
  unavailableReason: null,
  ...changes,
});
const settle = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};
const mount = async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const router = createMemoryRouter([
    {
      path: "/",
      element: (
        <QueryClientProvider client={client}>
          <TaskQuotations taskId="task" />
        </QueryClientProvider>
      ),
    },
    { path: "/quotations/:quotationId", element: <p>quotation</p> },
  ]);
  const state = { renderer: null as ReturnType<typeof create> | null };
  await act(async () => {
    state.renderer = create(<RouterProvider router={router} />);
  });
  await settle();
  return {
    router,
    client,
    buttons: () => state.renderer!.root.findAllByType(Button),
    close: async () => {
      await act(async () => {
        state.renderer?.unmount();
      });
      client.clear();
      queryClient.clear();
      router.dispose();
      setSession(null);
    },
  };
};

test("quotation context guards reject malformed summaries, permissions, and create results", () => {
  assert.equal(
    isQuotation({
      ...quotationFixture(),
      taskContextLocked: true,
      taskProjectLocked: false,
      taskLinks: [],
    }),
    true,
  );
  assert.equal(isQuotation({ ...quotationFixture(), taskContextLocked: "yes" }), false);
  assert.equal(
    isQuotation({
      ...quotationFixture(),
      taskLinks: [{ taskId: "q", title: null, isPrimary: true }],
    }),
    false,
  );
  assert.equal(isTaskQuotationContext(context()), true);
  assert.equal(
    isTaskQuotationContext(
      context({ quotations: [{ id: "q", number: "Q1", status: "draft", isPrimary: true }] }),
    ),
    true,
  );
  assert.equal(isTaskQuotationContext({ ...context(), canCreate: "yes" }), false);
  assert.equal(
    isTaskQuotationContext({
      ...context(),
      quotations: [{ id: "q", number: "Q1", status: "completed", isPrimary: true }],
    }),
    false,
  );
  assert.equal(isTaskQuotationResult({ quotationId: "q", created: false }), true);
  assert.equal(isTaskQuotationResult({ quotationId: null, created: true }), false);
});

test("no automatic creation; double invocation sends one request and opens the saved quotation", async () => {
  authorize(creator);
  const read = mock.method(taskService, "getQuotations", async () => context());
  const gate = Promise.withResolvers<{ quotationId: string; created: boolean }>();
  const createQuote = mock.method(taskService, "createQuotation", () => gate.promise);
  const view = await mount();
  try {
    assert.equal(createQuote.mock.callCount(), 0);
    const button = view.buttons().find(button => button.props.text === "יצירת הצעת מחיר")!;
    const requests: Promise<void>[] = [];
    await act(async () => {
      requests.push(button.props.onClick(), button.props.onClick());
    });
    assert.equal(createQuote.mock.callCount(), 1);
    await settle();
    assert.equal(view.buttons()[0].props.disabled, true);
    await act(async () => {
      gate.resolve({ quotationId: "saved", created: true });
      await Promise.all(requests);
    });
    assert.equal(view.router.state.location.pathname, "/quotations/saved");
  } finally {
    await view.close();
    read.mock.restore();
    createQuote.mock.restore();
  }
});

test("readers open only explicit primary and clone links without Create", async () => {
  authorize(reader);
  const read = mock.method(taskService, "getQuotations", async () =>
    context({
      canCreate: false,
      primaryQuotationId: "primary",
      quotations: [
        { id: "clone", number: "Q2", status: "review", isPrimary: false },
        { id: "primary", number: "Q1", status: "draft", isPrimary: true },
      ],
    }),
  );
  const view = await mount();
  try {
    assert.deepEqual(
      view.buttons().map(button => button.props.ariaLabel),
      ["פתיחת הצעה Q1", "פתיחת הצעה Q2"],
    );
    await act(async () => {
      await view.buttons()[1].props.onClick();
    });
    assert.equal(view.router.state.location.pathname, "/quotations/clone");
  } finally {
    await view.close();
    read.mock.restore();
  }
});

test("missing context blocks creation and missing quotation read permission skips the request", async () => {
  authorize(creator);
  const read = mock.method(taskService, "getQuotations", async () =>
    context({ canCreate: false, unavailableReason: "MISSING_CONTEXT" }),
  );
  const first = await mount();
  try {
    assert.equal(first.buttons().length, 0);
  } finally {
    await first.close();
  }
  authorize([PERMISSIONS.TASKS_READ]);
  const previousRequests = read.mock.callCount();
  const second = await mount();
  try {
    assert.equal(second.buttons().length, 0);
    assert.equal(read.mock.callCount(), previousRequests);
  } finally {
    await second.close();
    read.mock.restore();
  }
});

test("an authorization change suppresses stale navigation/cache invalidation", async () => {
  authorize(creator);
  const read = mock.method(taskService, "getQuotations", async () => context());
  const gate = Promise.withResolvers<{ quotationId: string; created: boolean }>();
  const createQuote = mock.method(taskService, "createQuotation", () => gate.promise);
  const invalidate = mock.method(queryClient, "invalidateQueries", async () => {});
  const log = mock.method(console, "error", () => {});
  const view = await mount();
  try {
    const requests: Promise<void>[] = [];
    await act(async () => {
      requests.push(view.buttons()[0].props.onClick());
    });
    await act(async () => {
      authorize(reader);
    });
    await act(async () => {
      gate.resolve({ quotationId: "old-account", created: true });
      await Promise.all(requests);
    });
    assert.equal(view.router.state.location.pathname, "/");
    assert.equal(invalidate.mock.callCount(), 0);
  } finally {
    await view.close();
    read.mock.restore();
    createQuote.mock.restore();
    invalidate.mock.restore();
    log.mock.restore();
  }
});

test("a failed response preserves the Create action and retries the same task", async () => {
  authorize(creator);
  const read = mock.method(taskService, "getQuotations", async () => context({ projectId: null }));
  const responses = [
    () => Promise.reject(new Error("lost response")),
    async () => ({ quotationId: "saved-after-retry", created: false }),
  ];
  const createQuote = mock.method(taskService, "createQuotation", () => responses.shift()!());
  const log = mock.method(console, "error", () => {});
  const view = await mount();
  try {
    await act(async () => {
      await view.buttons()[0].props.onClick();
    });
    await settle();
    assert.equal(view.router.state.location.pathname, "/");
    assert.equal(view.buttons()[0].props.disabled, false);
    await act(async () => {
      await view.buttons()[0].props.onClick();
    });
    assert.deepEqual(
      createQuote.mock.calls.map(call => call.arguments),
      [["task"], ["task"]],
    );
    assert.equal(view.router.state.location.pathname, "/quotations/saved-after-retry");
  } finally {
    await view.close();
    read.mock.restore();
    createQuote.mock.restore();
    log.mock.restore();
  }
});

for (const fixture of [
  {
    taskContextLocked: true,
    taskProjectLocked: true,
    canReadTasks: true,
    customerLocked: true,
    projectLocked: true,
  },
  {
    taskContextLocked: true,
    taskProjectLocked: false,
    canReadTasks: true,
    customerLocked: true,
    projectLocked: false,
  },
  {
    taskContextLocked: true,
    taskProjectLocked: true,
    canReadTasks: false,
    customerLocked: true,
    projectLocked: true,
  },
  {
    taskContextLocked: false,
    taskProjectLocked: false,
    canReadTasks: true,
    customerLocked: false,
    projectLocked: false,
  },
]) {
  test(`builder context locks and saved reverse links ${JSON.stringify(fixture)}`, async () => {
    const permissions = fixture.canReadTasks ? reader : [PERMISSIONS.QUOTATIONS_READ];
    authorize(permissions);
    const base = {
      ...quotationFixture(),
      taskContextLocked: fixture.taskContextLocked,
      taskProjectLocked: fixture.taskProjectLocked,
      taskLinks: [{ taskId: "saved-task", title: "משימת הצעה", isPrimary: true }],
    };
    const customers = mock.method(customerService, "getByFilter", async () => []);
    const customer = mock.method(customerService, "getById", async () => ({
      id: base.customerId,
      name: "customer",
    }));
    const projects = mock.method(quotationService, "projectChoices", async () => []);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    const router = createMemoryRouter([
      {
        path: "/",
        element: (
          <QueryClientProvider client={client}>
            <QuotationEditor editable initial={base} canExport={false} canApprove={false} />
          </QueryClientProvider>
        ),
      },
    ]);
    const state = { renderer: null as ReturnType<typeof create> | null };
    try {
      await act(async () => {
        state.renderer = create(<RouterProvider router={router} />);
      });
      const root = state.renderer!.root;
      assert.equal(
        Boolean(root.findByType(QuotationCustomerPicker).props.lockedReason),
        fixture.customerLocked,
      );
      assert.equal(
        Boolean(root.findByType(QuotationProjectPicker).props.lockedReason),
        fixture.projectLocked,
      );
      const links = root.findAllByType(BackLink);
      assert.equal(links.length, Number(fixture.canReadTasks));
      if (fixture.canReadTasks) {
        assert.equal(links[0].props.to, "/tasks/saved-task");
        assert.equal(links[0].props.label, "משימה: משימת הצעה");
      }
    } finally {
      await act(async () => {
        state.renderer?.unmount();
      });
      client.clear();
      router.dispose();
      setSession(null);
      customers.mock.restore();
      customer.mock.restore();
      projects.mock.restore();
    }
  });
}

test("task quotation services use context-only endpoints and validate server responses", async () => {
  const originalAdapter = httpClient.defaults.adapter;
  const requests: { url: string | null; method: string | null; data: unknown }[] = [];
  const responses = [
    context(),
    { quotationId: "saved", created: false },
    { quotationId: null, created: true },
  ];
  const log = mock.method(console, "error", () => {});
  httpClient.defaults.adapter = async config => {
    requests.push({
      url: config.url ?? null,
      method: config.method ?? null,
      data: config.data ?? null,
    });
    return { config, status: 200, statusText: "OK", headers: {}, data: responses.shift() };
  };
  try {
    assert.deepEqual(await taskService.getQuotations("task"), context());
    assert.deepEqual(await taskService.createQuotation("task"), {
      quotationId: "saved",
      created: false,
    });
    await assert.rejects(taskService.createQuotation("task"));
    assert.deepEqual(requests, [
      { url: "/task/task/quotations", method: "get", data: null },
      { url: "/task/task/quotation", method: "post", data: "{}" },
      { url: "/task/task/quotation", method: "post", data: "{}" },
    ]);
  } finally {
    httpClient.defaults.adapter = originalAdapter;
    log.mock.restore();
  }
});

test("quotation ordering puts the primary first without mutating source or secondary order", () => {
  const quotations = [
    { id: "clone-first", number: "Q2", status: "draft", isPrimary: false },
    { id: "primary", number: "Q1", status: "draft", isPrimary: true },
    { id: "clone-last", number: "Q3", status: "draft", isPrimary: false },
  ] satisfies ITaskQuotationContext["quotations"];
  assert.deepEqual(
    orderTaskQuotations(quotations).map(quotation => quotation.id),
    ["primary", "clone-first", "clone-last"],
  );
  assert.deepEqual(
    quotations.map(quotation => quotation.id),
    ["clone-first", "primary", "clone-last"],
  );
  assert.deepEqual(orderTaskQuotations([]), []);
  assert.equal(TASK_QUOTATION_KEYS.context("task", 7)[0], TASK_QUOTATION_KEYS.ROOT);
});

test("GET failure exposes explicit Retry and recovers without creating a document", async () => {
  authorize(creator);
  const responses = [() => Promise.reject(new Error("context unavailable")), async () => context()];
  const read = mock.method(taskService, "getQuotations", () => responses.shift()!());
  const createQuote = mock.method(taskService, "createQuotation");
  const view = await mount();
  try {
    assert.deepEqual(
      view.buttons().map(button => button.props.text),
      ["ניסיון נוסף"],
    );
    await act(async () => {
      await view.buttons()[0].props.onClick();
    });
    await settle();
    assert.deepEqual(
      view.buttons().map(button => button.props.text),
      ["יצירת הצעת מחיר"],
    );
    assert.equal(read.mock.callCount(), 2);
    assert.equal(createQuote.mock.callCount(), 0);
  } finally {
    await view.close();
    read.mock.restore();
    createQuote.mock.restore();
  }
});

test("a GET completed after authorization changes rejects its response before caching document metadata", async () => {
  authorize(creator);
  const gate = Promise.withResolvers<ITaskQuotationContext>();
  const read = mock.method(taskService, "getQuotations", () => gate.promise);
  const view = await mount();
  try {
    await act(async () => {
      authorize(reader);
    });
    await act(async () => {
      gate.resolve(
        context({
          quotations: [{ id: "private", number: "PRIVATE", status: "draft", isPrimary: true }],
        }),
      );
    });
    await settle();
    const queries = view.client.getQueryCache().findAll({ queryKey: [TASK_QUOTATION_KEYS.ROOT] });
    assert.equal(queries.length, 1);
    assert.equal(queries[0].state.data ?? null, null);
    assert.ok(queries[0].state.error instanceof AuthorizationContextChangedError);
    assert.equal(
      view.buttons().some(button => button.props.text === "פתיחת הצעה"),
      false,
    );
    assert.equal(view.router.state.location.pathname, "/");
  } finally {
    await view.close();
    read.mock.restore();
  }
});

for (const isConnected of [true, false]) {
  test(`failed Create restores focus only to a connected action: ${isConnected}`, async () => {
    authorize(creator);
    const read = mock.method(taskService, "getQuotations", async () => context());
    const createQuote = mock.method(taskService, "createQuotation", async () => {
      throw new Error("retryable failure");
    });
    const log = mock.method(console, "error", () => {});
    const focus = mock.fn();
    const action = { isConnected, focus };
    const view = await mount();
    try {
      await act(async () => {
        await view.buttons()[0].props.onClick({ currentTarget: action });
      });
      await settle();
      assert.equal(focus.mock.callCount(), Number(isConnected));
      if (isConnected) {
        assert.deepEqual(focus.mock.calls[0].arguments, [{ preventScroll: true }]);
      }
      assert.equal(view.buttons()[0].props.disabled, false);
      assert.equal(view.router.state.location.pathname, "/");
    } finally {
      await view.close();
      read.mock.restore();
      createQuote.mock.restore();
      log.mock.restore();
    }
  });
}

for (const statusSucceeds of [true, false]) {
  test(`TaskView status completion never opens email; explicit entry remains available: ${statusSucceeds}`, async () => {
    authorize([
      ...reader,
      PERMISSIONS.TASKS_STATUS_UPDATE,
      PERMISSIONS.PROJECTS_READ,
      PERMISSIONS.CUSTOMERS_READ,
      PERMISSIONS.DRIVE_READ,
    ]);
    const task = createTask({ taskType: TASK_TYPES.QUOTATION });
    const sentTask = { ...task, status: TASK_STATUSES.PROPOSAL_SENT };
    const read = mock.method(taskService, "getQuotations", async () => context());
    const history = mock.method(taskService, "getTransitions", async () => []);
    const status = mock.method(taskService, "updateStatus", async () => {
      if (!statusSucceeds) {
        throw new Error("status unavailable");
      }

      return sentTask;
    });
    const emailContext = mock.method(quotationExecutionEmailService, "getContext", async () => ({
      taskId: task.id,
      projectId: task.projectId ?? "project",
      projectName: "project",
      apartmentNumber: "12",
      contacts: [
        { id: "architect", name: "Architect", email: "architect@example.invalid", role: null },
      ],
      delivery: null,
    }));
    const preview = mock.method(quotationExecutionEmailService, "getPreview", async () => ({
      subject: "subject",
      body: "body",
      senderName: "sender",
    }));
    const send = mock.method(quotationExecutionEmailService, "send", async () => ({
      requestId: "request",
      updatedAt: task.updatedAt,
      retryable: false,
      providerMessageId: "message",
      status: QUOTATION_EMAIL_STATUS.SENT,
    }));
    const drive = mock.method(projectActivityService, "getDriveContents", async () => ({
      folderId: "folder",
      folders: [],
      files: [
        {
          id: "plan",
          name: "plan.pdf",
          mimeType: "application/pdf",
          isFolder: false,
          size: null,
          webViewLink: null,
          modifiedTime: null,
        },
        {
          id: "zip",
          name: "files.zip",
          mimeType: "application/zip",
          isFolder: false,
          size: null,
          webViewLink: null,
          modifiedTime: null,
        },
      ],
    }));
    const quotations = mock.method(quotationService, "projectQuotations", async () => ({
      total: 1,
      nextCursor: null,
      items: [
        {
          ...quotationFixture(),
          id: "quotation",
          projectId: task.projectId,
          sharedCount: 0,
          sharedFromCode: null,
          sharedApartmentNumbers: [],
          projectRole: QUOTATION_PROJECT_ROLE.PRIMARY,
        },
      ],
    }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    const render = (currentTask: typeof task): ReactElement => (
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <TaskView
            canChangeStatus
            canEdit={false}
            canClaim={false}
            canAssign={false}
            task={currentTask}
            canChangeUrgency={false}
          />
        </MemoryRouter>
      </QueryClientProvider>
    );
    const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
    try {
      await act(async () => {
        state.renderer = create(render(task));
      });
      await settle();
      assert.ok(state.renderer);
      const renderer = state.renderer;
      const dialogs = (): ReactTestInstance[] =>
        renderer.root.findAllByType(GenericPopup).filter(dialog => dialog.props.open);
      assert.equal(dialogs().length, 0);
      await act(async () =>
        renderer.root.findByType(TaskHeaderCard).props.onStatusChange(TASK_STATUSES.PROPOSAL_SENT),
      );
      await settle();
      assert.deepEqual(status.mock.calls[0].arguments, [task.id, TASK_STATUSES.PROPOSAL_SENT]);
      assert.equal(dialogs().length, 0);
      assert.equal(emailContext.mock.callCount(), 0);
      assert.equal(send.mock.callCount(), 0);
      assert.equal(renderer.root.findAllByType(InlineError).length, Number(!statusSucceeds));
      await act(async () => renderer.update(render(sentTask)));
      assert.equal(dialogs().length, 0);
      const compose = renderer.root
        .findAllByType(Button)
        .find(button => button.props.text === "שליחת תוכנית לביצוע במייל");
      assert.ok(compose);
      await act(async () => compose.props.onClick());
      await settle();
      assert.equal(dialogs().length, 1);
      assert.equal(emailContext.mock.callCount(), 1);
      assert.equal(dialogs()[0].props.buttons.primary.text, QUOTATION_EMAIL_STEP_ACTION_LABELS[1]);
      assert.equal(dialogs()[0].props.buttons.primary.isDisabled, true);
      assert.equal(preview.mock.callCount(), 0);
      assert.equal(send.mock.callCount(), 0);
      await act(async () => dialogs()[0].props.buttons.secondary.onClick());
      assert.equal(dialogs().length, 0);
      assert.equal(send.mock.callCount(), 0);
      assert.equal(status.mock.callCount(), 1);
      await act(async () => compose.props.onClick());
      await settle();
      const clickButton = async (text: string): Promise<void> => {
        const button = renderer.root.findAllByType(Button).find(item => item.props.text === text);
        assert.ok(button);
        await act(async () => button.props.onClick());
      };
      await act(async () => renderer.root.findByType(CheckBox).props.onChange(true));
      await clickButton("סמן כאדריכל");
      await act(async () =>
        renderer.root
          .findAllByType(Autocomplete)
          .find(item => item.props.title === "הצעת מחיר לתוכנית")!
          .props.onChange("quotation"),
      );
      await act(async () =>
        renderer.root
          .findAllByType(TextField)
          .find(item => item.props.title === "גרסת התוכנית")!
          .props.onChange("03"),
      );
      assert.equal(dialogs()[0].props.buttons.primary.isDisabled, false);
      await act(async () => dialogs()[0].props.buttons.primary.onClick());
      await settle();
      await clickButton("תוכנית: plan.pdf");
      await clickButton("ZIP: files.zip");
      assert.equal(preview.mock.callCount(), 1);
      assert.equal(send.mock.callCount(), 0);
      assert.equal(dialogs()[0].props.buttons.primary.isDisabled, false);
      await act(async () => dialogs()[0].props.buttons.primary.onClick());
      await settle();
      assert.equal(send.mock.callCount(), 1);
      const [sentTaskId, payload] = send.mock.calls[0].arguments;
      assert.equal(sentTaskId, task.id);
      assert.ok(payload);
      assert.deepEqual(payload, {
        quotationId: "quotation",
        requestId: payload.requestId,
        recipientContactIds: ["architect"],
        architectContactId: "architect",
        planVersion: "03",
        planFileId: "plan",
        zipFileId: "zip",
      });
      assert.equal(status.mock.callCount(), 1);
      assert.equal(dialogs()[0].props.buttons.primary.text, "סגירה");
    } finally {
      await act(async () => state.renderer?.unmount());
      client.clear();
      queryClient.clear();
      setSession(null);
      [read, history, status, emailContext, preview, send, quotations, drive].forEach(stub =>
        stub.mock.restore(),
      );
    }
  });
}
