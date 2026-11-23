import {
  QuotationCloneCommand,
  completeQuotationClone,
} from "../src/actions/quotation-clone.actions";

import type {
  ICloneExecution,
  ICloneBrandOption,
} from "../src/interfaces/quotation-clone.interface";

import { test, mock } from "node:test";
import assert from "node:assert/strict";
import type { AxiosResponse } from "axios";
import { AxiosError, AxiosHeaders } from "axios";
import { quotationFixture } from "./quotation.fixture";
import { logger } from "../src/utilities/logger.utility";
import { TIME_UNITS } from "../src/constants/time.constant";
import { setTimeout as settle } from "node:timers/promises";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { httpClient } from "../src/services/http-client.service";
import { getSession, setSession } from "../src/store/session.store";
import type { ISession } from "../src/interfaces/session.interface";
import { BUTTON_TYPES } from "../src/constants/button-type.constant";
import { quotationService } from "../src/services/quotation.service";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { cloneFailure } from "../src/utilities/quotation-clone.utility";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { CLONE_ERROR_CODES } from "../src/constants/quotation-clone.constant";
import QuotationSelect from "../src/pages/quotations/components/QuotationSelect";
import QuotationButton from "../src/pages/quotations/components/QuotationButton";
import { CommandIdentityManager } from "../src/managers/command-identity.manager";
import { isRecommendedCloneCommand } from "../src/utilities/quotation-clone.utility";
import { AuthorizationContext } from "../src/managers/authorization-context.manager";
import type { IRecommendedCloneCommand } from "../src/interfaces/quotation.interface";
import QuotationCloneForm from "../src/pages/quotations/components/QuotationCloneForm";
import { QuotationCloneStorageManager } from "../src/managers/quotation-clone-storage.manager";

interface ITestRendererState {
  current: ReactTestRenderer | null;
}

interface ITestFocusableNode {
  focus: () => void;
  isConnected: boolean;
}

const CLONE_TEST_DELAYS = {
  QUERY: (TIME_UNITS.SECOND_MS * 3) / 100,
  RENDER: (TIME_UNITS.SECOND_MS * 3) / 200,
  UPDATE: TIME_UNITS.SECOND_MS / 200,
} as const;

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
Reflect.set(globalThis, "window", new EventTarget());

const input = (execute: ICloneExecution["execute"]): ICloneExecution => ({
  execute,
  targetBrand: "תדיראן",
  sourceVersion: 1,
  onSuccess: (): void => {},
  onFailure: (): void => {},
  onPending: (): void => {},
});

const responseError = (status: number, data: unknown): AxiosError =>
  new AxiosError("failed", "ERR_BAD_RESPONSE", void 0, null, {
    status,
    data,
    statusText: "error",
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

test("single flight freezes payload through unknown outcome and background version refresh; changed intent gets a new key", async (): Promise<void> => {
  const identities = mock.method(CommandIdentityManager, "create", (): string =>
    crypto.randomUUID(),
  );
  const command = new QuotationCloneCommand("source");
  command.activate();
  const requests: IRecommendedCloneCommand[] = [];
  const deferred = Promise.withResolvers<ReturnType<typeof quotationFixture>>();
  const execute = async (
    payload: IRecommendedCloneCommand,
  ): Promise<ReturnType<typeof quotationFixture>> => {
    requests.push(payload);
    return deferred.promise;
  };
  const running = command.submit(input(execute));
  await command.submit(input(execute));
  assert.equal(requests.length, 1);
  deferred.reject(new Error("timeout"));
  await running;
  await command.submit({
    ...input(async (payload): Promise<ReturnType<typeof quotationFixture>> => {
      requests.push(payload);
      throw new Error("unknown");
    }),
    sourceVersion: 99,
  });
  assert.deepEqual(requests[1], requests[0]);
  await command.submit({
    ...input(async (payload): Promise<ReturnType<typeof quotationFixture>> => {
      requests.push(payload);
      throw new Error("unknown");
    }),
    sourceVersion: 99,
    targetBrand: "LG",
  });
  assert.equal(requests[2]?.sourceVersion, 99);
  assert.notEqual(requests[2]?.idempotencyKey, requests[0]?.idempotencyKey);
  identities.mock.restore();
});

test("late route completion cannot publish success; successful command navigates only once", async (): Promise<void> => {
  const command = new QuotationCloneCommand("source");
  command.activate();
  const deferred = Promise.withResolvers<ReturnType<typeof quotationFixture>>();
  const succeeded = mock.fn((): void => {});
  const running = command.submit({
    ...input(async (): Promise<ReturnType<typeof quotationFixture>> => deferred.promise),
    onSuccess: succeeded,
  });
  command.deactivate();
  deferred.resolve(quotationFixture());
  await running;
  assert.equal(succeeded.mock.callCount(), 0);
  const next = new QuotationCloneCommand("source");
  next.activate();
  const execution = {
    ...input(async (): Promise<ReturnType<typeof quotationFixture>> => quotationFixture()),
    onSuccess: succeeded,
  };
  await next.submit(execution);
  await next.submit(execution);
  assert.equal(succeeded.mock.callCount(), 1);
});

test("safe mapping errors preserve affected lines and unknown outcomes never claim no draft", (): void => {
  const failure = cloneFailure(
    responseError(400, {
      code: CLONE_ERROR_CODES.MAPPING_FAILED,
      safeResponse: { issues: [{ sku: "SKU", description: "item", reason: "missing" }] },
    }),
  );
  assert.match(failure.lines.join(), /SKU.*missing/);
  assert.match(cloneFailure(new Error("timeout")).title, /לא התקבל אישור/);
  assert.equal(
    cloneFailure(responseError(409, { code: CLONE_ERROR_CODES.SOURCE_CHANGED })).staleSource,
    true,
  );
});

test("real form submits one recommended command, no catalogue grid, preserves target on failure and navigates to new draft", async (): Promise<void> => {
  const source = quotationFixture();
  const get = mock.method(quotationService, "get", async (): Promise<typeof source> => source);
  const catalogue = mock.method(quotationService, "catalogue", async (): Promise<[]> => []);
  const requests: IRecommendedCloneCommand[] = [];
  const clone = mock.method(
    quotationService,
    "cloneRecommended",
    async (payload: IRecommendedCloneCommand): Promise<typeof source> => {
      requests.push(payload);
      if (requests.length === 1) {
        throw new Error("timeout");
      }
      return { ...source, id: "new-draft" };
    },
  );
  const router = createMemoryRouter(
    [{ path: "*", element: <QuotationCloneForm sourceId={source.id} onCancel={(): void => {}} /> }],
    { initialEntries: ["/quotations?cloneFrom=quote1"] },
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const renderer: ITestRendererState = { current: null };
  await act(async (): Promise<void> => {
    renderer.current = create(
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );
    await settle(CLONE_TEST_DELAYS.QUERY);
  });
  const view = renderer.current;
  assert.ok(view);
  await act(async (): Promise<void> => {
    await settle(CLONE_TEST_DELAYS.QUERY);
  });
  assert.equal(view.root.findAllByType(QuotationSelect).length, 1);
  assert.equal(catalogue.mock.callCount(), 0);
  await act(async (): Promise<void> => {
    view.root.findByType(QuotationSelect).props.onChange({ target: { value: "תדיראן" } });
  });
  const form = (): ReturnType<typeof view.root.find> =>
    view.root.find((node): boolean => node.props.component === "form");
  await act(async (): Promise<void> => {
    form().props.onSubmit({ preventDefault: (): void => {} });
    await settle(CLONE_TEST_DELAYS.UPDATE);
  });
  assert.equal(view.root.findByType(QuotationSelect).props.value, "תדיראן");
  assert.match(JSON.stringify(view.toJSON()), /לא התקבל אישור/);
  await act(async (): Promise<void> => {
    form().props.onSubmit({ preventDefault: (): void => {} });
    await settle(CLONE_TEST_DELAYS.UPDATE);
  });
  assert.deepEqual(requests[0], requests[1]);
  assert.equal(router.state.location.pathname, "/quotations/new-draft");
  assert.equal(view.root.findAllByType(QuotationButton).length > 0, true);
  await act(async (): Promise<void> => {
    view.unmount();
  });
  get.mock.restore();
  catalogue.mock.restore();
  clone.mock.restore();
  client.clear();
});

test("authorization changes suppress late navigation and cache callbacks", async (): Promise<void> => {
  const command = new QuotationCloneCommand("authorization-source");
  command.activate();
  const deferred = Promise.withResolvers<ReturnType<typeof quotationFixture>>();
  const succeeded = mock.fn((): void => {});
  const current = mock.method(AuthorizationContext.prototype, "isCurrent", (): boolean => true);
  const running = command.submit({
    ...input(async (): Promise<ReturnType<typeof quotationFixture>> => deferred.promise),
    onSuccess: succeeded,
  });
  current.mock.mockImplementation((): boolean => false);
  deferred.resolve(quotationFixture());
  await running;
  assert.equal(succeeded.mock.callCount(), 0);
  current.mock.restore();
});

test("stored unknown-outcome command survives remount with its original version", async (): Promise<void> => {
  const store = new Map<string, string>();
  Reflect.set(globalThis, "sessionStorage", {
    getItem: (key: string): string | null => store.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      store.set(key, value);
    },
    removeItem: (key: string): void => {
      store.delete(key);
    },
  });
  const requests: IRecommendedCloneCommand[] = [];
  const execute = async (
    payload: IRecommendedCloneCommand,
  ): Promise<ReturnType<typeof quotationFixture>> => {
    requests.push(payload);
    throw new Error("timeout");
  };
  const original = new QuotationCloneCommand("durable-source");
  original.activate();
  await original.submit(input(execute));
  original.deactivate();
  const restored = new QuotationCloneCommand("durable-source");
  restored.activate();
  assert.equal(restored.getTargetBrand(), "תדיראן");
  await restored.submit({ ...input(execute), sourceVersion: 300 });
  assert.deepEqual(requests[0], requests[1]);
  restored.reset();
  await restored.submit({ ...input(execute), sourceVersion: 300 });
  assert.equal(requests[2]?.sourceVersion, 300);
  assert.notEqual(requests[0]?.idempotencyKey, requests[2]?.idempotencyKey);
  Reflect.deleteProperty(globalThis, "sessionStorage");
});

test("multi-brand and General-only sources expose no create action", async (): Promise<void> => {
  for (const brands of [[], ["אלקטרה", "תדיראן"]]) {
    const source = { ...quotationFixture(), brands };
    const get = mock.method(quotationService, "get", async (): Promise<typeof source> => source);
    const router = createMemoryRouter([
      { path: "*", element: <QuotationCloneForm sourceId={source.id} onCancel={(): void => {}} /> },
    ]);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const renderer: ITestRendererState = { current: null };
    await act(async (): Promise<void> => {
      renderer.current = create(
        <QueryClientProvider client={client}>
          <RouterProvider router={router} />
        </QueryClientProvider>,
      );
      await settle(CLONE_TEST_DELAYS.RENDER);
    });
    await act(async (): Promise<void> => {
      await settle(CLONE_TEST_DELAYS.RENDER);
    });
    const view = renderer.current;
    assert.ok(view);
    assert.equal(view.root.findAllByType(QuotationSelect).length, 0);
    assert.equal(
      view.root
        .findAllByType(QuotationButton)
        .some((node): boolean => node.props.text === "צור הצעה חדשה"),
      false,
    );
    await act(async (): Promise<void> => {
      view.unmount();
    });
    get.mock.restore();
    client.clear();
  }
});

test("shared button bridges native default/submit types, one click, and disabled state", async (): Promise<void> => {
  const clicked = mock.fn((): void => {});
  const renderer: ITestRendererState = { current: null };
  await act(async (): Promise<void> => {
    renderer.current = create(<QuotationButton text="ordinary" onClick={clicked} />);
  });
  const view = renderer.current;
  assert.ok(view);
  const ordinary = view.root.findByType("button");
  assert.equal(ordinary.props.type, BUTTON_TYPES.BUTTON);
  await act(async (): Promise<void> => {
    ordinary.props.onClick({});
  });
  assert.equal(clicked.mock.callCount(), 1);
  await act(async (): Promise<void> => {
    view.update(<QuotationButton text="submit" type={BUTTON_TYPES.SUBMIT} />);
  });
  assert.equal(view.root.findByType("button").props.type, BUTTON_TYPES.SUBMIT);
  await act(async (): Promise<void> => {
    view.update(<QuotationButton disabled text="submit" type={BUTTON_TYPES.SUBMIT} />);
  });
  assert.equal(view.root.findByType("button").props.disabled, true);
  await act(async (): Promise<void> => {
    view.unmount();
  });
});

test("recommended clone service sends exact frozen command contract to the separate endpoint", async (): Promise<void> => {
  const adapter = httpClient.defaults.adapter;
  const payload: IRecommendedCloneCommand = {
    sourceId: "source",
    sourceVersion: 4,
    targetBrand: "LG",
    idempotencyKey: crypto.randomUUID(),
  };
  httpClient.defaults.adapter = async (config): Promise<AxiosResponse<unknown>> => {
    assert.equal(config.url, "/quotation/source/clone-recommended");
    assert.equal(config.method, "post");
    assert.deepEqual(JSON.parse(config.data), {
      sourceVersion: 4,
      targetBrand: "LG",
      idempotencyKey: payload.idempotencyKey,
    });
    return { config, status: 201, statusText: "Created", headers: {}, data: quotationFixture() };
  };
  try {
    assert.equal((await quotationService.cloneRecommended(payload)).id, "quote1");
  } finally {
    httpClient.defaults.adapter = adapter;
  }
});

test("real form disables pending controls, focuses stale error, keeps selection, and refreshes before explicit new command", async (): Promise<void> => {
  const source = quotationFixture();
  const get = mock.method(quotationService, "get", async (): Promise<typeof source> => source);
  const requests: IRecommendedCloneCommand[] = [];
  const deferred = Promise.withResolvers<typeof source>();
  const clone = mock.method(
    quotationService,
    "cloneRecommended",
    async (payload: IRecommendedCloneCommand): Promise<typeof source> => {
      requests.push(payload);
      if (requests.length === 1) {
        return deferred.promise;
      }
      throw responseError(403, { message: "אין הרשאה" });
    },
  );
  const focused = mock.fn((): void => {});
  const router = createMemoryRouter([
    { path: "*", element: <QuotationCloneForm sourceId={source.id} onCancel={(): void => {}} /> },
  ]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const renderer: ITestRendererState = { current: null };
  await act(async (): Promise<void> => {
    renderer.current = create(
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
      {
        createNodeMock: (): ITestFocusableNode => ({
          isConnected: true,
          focus: focused,
        }),
      },
    );
    await settle(CLONE_TEST_DELAYS.RENDER);
  });
  await act(async (): Promise<void> => {
    await settle(CLONE_TEST_DELAYS.RENDER);
  });
  const view = renderer.current;
  assert.ok(view);
  await act(async (): Promise<void> => {
    view.root.findByType(QuotationSelect).props.onChange({ target: { value: "תדיראן" } });
  });
  const submit = (): void =>
    view.root
      .find((node): boolean => node.props.component === "form")
      .props.onSubmit({ preventDefault: (): void => {} });
  await act(async (): Promise<void> => {
    submit();
    submit();
  });
  assert.equal(requests.length, 1);
  assert.equal(view.root.findByType(QuotationSelect).props.disabled, true);
  assert.equal(
    view.root.findAllByType(QuotationButton).every((node): boolean => node.props.disabled === true),
    true,
  );
  await act(async (): Promise<void> => {
    deferred.reject(responseError(409, { code: CLONE_ERROR_CODES.SOURCE_CHANGED }));
    await settle(CLONE_TEST_DELAYS.UPDATE);
  });
  assert.equal(view.root.findByType(QuotationSelect).props.value, "תדיראן");
  assert.equal(focused.mock.callCount() > 0, true);
  assert.equal(
    view.root
      .findAllByType(QuotationButton)
      .find((node): boolean => node.props.type === BUTTON_TYPES.SUBMIT)?.props.disabled,
    true,
  );
  source.version = 2;
  await act(async (): Promise<void> => {
    await view.root
      .findAllByType(QuotationButton)
      .find((node): boolean => node.props.text === "רענן הצעת מקור")
      ?.props.onClick();
    await settle(CLONE_TEST_DELAYS.UPDATE);
  });
  assert.equal(view.root.findByType(QuotationSelect).props.value, "תדיראן");
  await act(async (): Promise<void> => {
    submit();
    await settle(CLONE_TEST_DELAYS.UPDATE);
  });
  assert.equal(requests[1]?.sourceVersion, 2);
  assert.notEqual(requests[1]?.idempotencyKey, requests[0]?.idempotencyKey);
  assert.match(JSON.stringify(view.toJSON()), /אין הרשאה/);
  assert.equal(router.state.location.pathname, "/");
  await act(async (): Promise<void> => {
    view.unmount();
  });
  get.mock.restore();
  clone.mock.restore();
  client.clear();
});

test("navigation waits for invalidation and is suppressed if route or account changes while waiting", async (): Promise<void> => {
  const client = new QueryClient();
  const deferred = Promise.withResolvers<void>();
  const invalidated = mock.method(
    client,
    "invalidateQueries",
    async (): Promise<void> => deferred.promise,
  );
  const navigate = mock.fn(async (): Promise<void> => {});
  const state = { current: true };
  const completion = completeQuotationClone({
    queryClient: client,
    quotation: quotationFixture(),
    navigate,
    isCurrent: (): boolean => state.current,
  });
  assert.equal(invalidated.mock.callCount(), 3);
  assert.equal(navigate.mock.callCount(), 0);
  state.current = false;
  deferred.resolve();
  await completion;
  assert.equal(navigate.mock.callCount(), 0);
  invalidated.mock.restore();
  client.clear();
});

interface IRecoveryScenario {
  name: string;
  brands: string[];
  failure: number | null;
}

const RECOVERY_SCENARIOS: IRecoveryScenario[] = [
  { name: "multi-brand", brands: ["אלקטרה", "תדיראן"], failure: null },
  { name: "General-only", brands: [], failure: null },
  { name: "target is now source brand", brands: ["תדיראן"], failure: null },
  { name: "source GET404", brands: [], failure: 404 },
  { name: "source unavailable", brands: [], failure: 503 },
];

for (const scenario of RECOVERY_SCENARIOS) {
  test(`real form recovers its exact unknown-outcome command after ${scenario.name}`, async (): Promise<void> => {
    const source = { ...quotationFixture(), id: `recovery-${scenario.name}` };
    const state = { changed: false };
    const get = mock.method(quotationService, "get", async (): Promise<typeof source> => {
      if (!state.changed) {
        return source;
      }
      if (scenario.failure !== null) {
        throw responseError(scenario.failure, { message: "source no longer available" });
      }
      return { ...source, version: 100, brands: scenario.brands };
    });
    const requests: IRecommendedCloneCommand[] = [];
    const result = { ...source, id: "recovered-draft" };
    const clone = mock.method(
      quotationService,
      "cloneRecommended",
      async (payload: IRecommendedCloneCommand): Promise<typeof source> => {
        requests.push(payload);
        if (requests.length === 1) {
          throw new Error("outcome unknown");
        }
        return result;
      },
    );
    const router = createMemoryRouter([
      { path: "*", element: <QuotationCloneForm sourceId={source.id} onCancel={(): void => {}} /> },
    ]);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const renderer: ITestRendererState = { current: null };
    await act(async (): Promise<void> => {
      renderer.current = create(
        <QueryClientProvider client={client}>
          <RouterProvider router={router} />
        </QueryClientProvider>,
      );
      await settle(CLONE_TEST_DELAYS.RENDER);
    });
    await act(async (): Promise<void> => {
      await settle(CLONE_TEST_DELAYS.RENDER);
    });
    const view = renderer.current;
    assert.ok(view);
    await act(async (): Promise<void> => {
      view.root.findByType(QuotationSelect).props.onChange({ target: { value: "תדיראן" } });
    });
    const submit = async (): Promise<void> =>
      view.root
        .find((node): boolean => node.props.component === "form")
        .props.onSubmit({ preventDefault: (): void => {} });
    await act(async (): Promise<void> => {
      await submit();
    });
    state.changed = true;
    await act(async (): Promise<void> => {
      await client.refetchQueries({ queryKey: ["quotation-clone-source", source.id] });
      await settle(CLONE_TEST_DELAYS.UPDATE);
    });
    const selector = view.root.findByType(QuotationSelect);
    assert.equal(selector.props.value, "תדיראן");
    assert.equal(
      selector.props.items.some((option: ICloneBrandOption): boolean => option.value === "תדיראן"),
      true,
    );
    assert.equal(
      view.root
        .findAllByType(QuotationButton)
        .find((node): boolean => node.props.type === BUTTON_TYPES.SUBMIT)?.props.disabled,
      false,
    );
    await act(async (): Promise<void> => {
      await submit();
    });
    assert.deepEqual(requests[1], requests[0]);
    assert.equal(requests[1]?.sourceVersion, 1);
    assert.equal(router.state.location.pathname, "/quotations/recovered-draft");
    await act(async (): Promise<void> => {
      view.unmount();
    });
    get.mock.restore();
    clone.mock.restore();
    client.clear();
  });
}

test("real form exposes persisted recovery while current source is still loading", async (): Promise<void> => {
  const sourceId = "recovery-loading";
  const command = new QuotationCloneCommand(sourceId);
  const requests: IRecommendedCloneCommand[] = [];
  command.activate();
  await command.submit(
    input(async (payload): Promise<ReturnType<typeof quotationFixture>> => {
      requests.push(payload);
      throw new Error("outcome unknown");
    }),
  );
  command.deactivate();
  const loading = Promise.withResolvers<ReturnType<typeof quotationFixture>>();
  const get = mock.method(
    quotationService,
    "get",
    async (): Promise<ReturnType<typeof quotationFixture>> => loading.promise,
  );
  const clone = mock.method(
    quotationService,
    "cloneRecommended",
    async (payload: IRecommendedCloneCommand): Promise<ReturnType<typeof quotationFixture>> => {
      requests.push(payload);
      return { ...quotationFixture(), id: "loading-recovered" };
    },
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter([
    { path: "*", element: <QuotationCloneForm sourceId={sourceId} onCancel={(): void => {}} /> },
  ]);
  const renderer: ITestRendererState = { current: null };
  await act(async (): Promise<void> => {
    renderer.current = create(
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );
  });
  const view = renderer.current;
  assert.ok(view);
  assert.equal(view.root.findByType(QuotationSelect).props.value, "תדיראן");
  await act(async (): Promise<void> => {
    await view.root
      .find((node): boolean => node.props.component === "form")
      .props.onSubmit({ preventDefault: (): void => {} });
  });
  assert.deepEqual(requests[1], requests[0]);
  assert.equal(router.state.location.pathname, "/quotations/loading-recovered");
  await act(async (): Promise<void> => {
    view.unmount();
  });
  loading.resolve(quotationFixture());
  get.mock.restore();
  clone.mock.restore();
  client.clear();
});

test("blocked browser storage retains actor/source-scoped commands across instances and clears success/reset", async (): Promise<void> => {
  const previousStorage: unknown = Reflect.get(globalThis, "sessionStorage");
  const previousSession = getSession();
  const warnings = mock.method(logger, "warn", (): void => {});
  Reflect.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    get: (): never => {
      throw new Error("SECRET blocked storage");
    },
  });
  const sessionFor = (id: string): ISession => ({
    accessToken: "test-token",
    user: {
      id,
      email: "test@example.invalid",
      phone: "",
      firstName: "Test",
      lastName: "User",
      role: USER_ROLES.SYSTEM_ADMIN,
      assignedRoles: [USER_ROLES.SYSTEM_ADMIN],
      employeeNumber: "TEST",
      deletedAt: null,
      permissions: [],
    },
  });
  try {
    setSession(sessionFor("fallback-actor-A"));
    const original = new QuotationCloneCommand("fallback-source");
    original.activate();
    await original.submit(
      input(async (): Promise<ReturnType<typeof quotationFixture>> => {
        throw new Error("unknown");
      }),
    );
    const frozen = original.getCommand();
    assert.ok(frozen);
    original.deactivate();
    const restored = new QuotationCloneCommand("fallback-source");
    assert.deepEqual(restored.getCommand(), frozen);
    assert.equal(new QuotationCloneCommand("other-source").getCommand(), null);
    setSession(sessionFor("fallback-actor-B"));
    assert.equal(new QuotationCloneCommand("fallback-source").getCommand(), null);
    setSession(sessionFor("fallback-actor-A"));
    const replay = new QuotationCloneCommand("fallback-source");
    replay.activate();
    await replay.submit({
      ...input(async (payload): Promise<ReturnType<typeof quotationFixture>> => {
        assert.deepEqual(payload, frozen);
        return quotationFixture();
      }),
      sourceVersion: 100,
    });
    assert.equal(new QuotationCloneCommand("fallback-source").getCommand(), null);
    const deliberate = new QuotationCloneCommand("fallback-source");
    deliberate.activate();
    await deliberate.submit(
      input(async (): Promise<ReturnType<typeof quotationFixture>> => {
        throw new Error("unknown");
      }),
    );
    assert.notEqual(deliberate.getCommand()?.idempotencyKey, frozen.idempotencyKey);
    deliberate.reset();
    assert.equal(new QuotationCloneCommand("fallback-source").getCommand(), null);
    assert.equal(JSON.stringify(warnings.mock.calls).includes("SECRET"), false);
    assert.equal(warnings.mock.callCount() > 0, true);
  } finally {
    Reflect.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      writable: true,
      value: previousStorage,
    });
    setSession(previousSession);
    warnings.mock.restore();
  }
});

test("nullable persisted command validation rejects invalid versions and key shapes", (): void => {
  const valid: IRecommendedCloneCommand = {
    sourceId: "source",
    sourceVersion: 1,
    targetBrand: "LG",
    idempotencyKey: crypto.randomUUID(),
  };
  assert.equal(isRecommendedCloneCommand(valid), true);
  const invalid: unknown[] = [
    null,
    [],
    {},
    { ...valid, sourceId: " " },
    { ...valid, targetBrand: "" },
    { ...valid, idempotencyKey: "not-a-uuid" },
    ...[0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1].map(
      (sourceVersion): IRecommendedCloneCommand => ({ ...valid, sourceVersion }),
    ),
  ];
  for (const value of invalid) {
    assert.equal(isRecommendedCloneCommand(value), false);
  }
});

test("command and storage failures log allowlisted diagnostics without response payload or credentials", async (): Promise<void> => {
  const failures = mock.method(logger, "error", (): void => {});
  const warnings = mock.method(logger, "warn", (): void => {});
  const previousStorage: unknown = Reflect.get(globalThis, "sessionStorage");
  Reflect.set(globalThis, "sessionStorage", {
    getItem: (): string => "{SECRET",
    setItem: (): never => {
      throw new Error("SECRET");
    },
    removeItem: (): never => {
      throw new Error("SECRET");
    },
  });
  try {
    assert.equal(QuotationCloneStorageManager.read("malformed-json-diagnostics"), null);
    const command = new QuotationCloneCommand("diagnostic-source");
    command.activate();
    await command.submit(
      input(async (): Promise<ReturnType<typeof quotationFixture>> => {
        throw responseError(400, {
          code: CLONE_ERROR_CODES.MAPPING_FAILED,
          message: "SECRET",
          token: "SECRET",
          safeResponse: { issues: ["SECRET"] },
        });
      }),
    );
    command.reset();
    const diagnostic = failures.mock.calls.at(-1)?.arguments[1];
    assert.equal(diagnostic?.status, 400);
    assert.equal(diagnostic?.code, CLONE_ERROR_CODES.MAPPING_FAILED);
    assert.equal(typeof diagnostic?.classification, "string");
    assert.equal(JSON.stringify(failures.mock.calls).includes("SECRET"), false);
    assert.equal(JSON.stringify(warnings.mock.calls).includes("SECRET"), false);
    assert.equal(
      warnings.mock.calls.some((call): boolean => call.arguments[1]?.cause === "invalid-json"),
      true,
    );
  } finally {
    Reflect.set(globalThis, "sessionStorage", previousStorage);
    failures.mock.restore();
    warnings.mock.restore();
  }
});
