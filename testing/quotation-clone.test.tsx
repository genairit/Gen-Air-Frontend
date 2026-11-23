import {
  QuotationCloneCommand,
  completeQuotationClone,
} from "../src/actions/quotation-clone.actions";

import { test, mock } from "node:test";
import assert from "node:assert/strict";
import type { AxiosResponse } from "axios";
import { AxiosError, AxiosHeaders } from "axios";
import { quotationFixture } from "./quotation.fixture";
import { setTimeout as settle } from "node:timers/promises";
import { httpClient } from "../src/services/http-client.service";
import { BUTTON_TYPES } from "../src/constants/button-type.constant";
import { quotationService } from "../src/services/quotation.service";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { cloneFailure } from "../src/utilities/quotation-clone.utility";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import QuotationSelect from "../src/pages/quotations/components/QuotationSelect";
import QuotationButton from "../src/pages/quotations/components/QuotationButton";
import { CommandIdentityManager } from "../src/managers/command-identity.manager";
import type { ICloneExecution } from "../src/interfaces/quotation-clone.interface";
import { AuthorizationContext } from "../src/managers/authorization-context.manager";
import type { IRecommendedCloneCommand } from "../src/interfaces/quotation.interface";
import QuotationCloneForm from "../src/pages/quotations/components/QuotationCloneForm";

interface ITestRendererState {
  current: ReactTestRenderer | null;
}

interface ITestFocusableNode {
  focus: () => void;
  isConnected: boolean;
}

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
      code: "QUOTATION_CLONE_MAPPING_FAILED",
      safeResponse: { issues: [{ sku: "SKU", description: "item", reason: "missing" }] },
    }),
  );
  assert.match(failure.lines.join(), /SKU.*missing/);
  assert.match(cloneFailure(new Error("timeout")).title, /לא התקבל אישור/);
  assert.equal(
    cloneFailure(responseError(409, { code: "QUOTATION_CLONE_SOURCE_CHANGED" })).staleSource,
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
    await settle(30);
  });
  const view = renderer.current;
  assert.ok(view);
  await act(async (): Promise<void> => {
    await settle(30);
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
    await settle(5);
  });
  assert.equal(view.root.findByType(QuotationSelect).props.value, "תדיראן");
  assert.match(JSON.stringify(view.toJSON()), /לא התקבל אישור/);
  await act(async (): Promise<void> => {
    form().props.onSubmit({ preventDefault: (): void => {} });
    await settle(5);
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
      await settle(15);
    });
    await act(async (): Promise<void> => {
      await settle(15);
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
    await settle(15);
  });
  await act(async (): Promise<void> => {
    await settle(15);
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
    deferred.reject(responseError(409, { code: "QUOTATION_CLONE_SOURCE_CHANGED" }));
    await settle(5);
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
    await settle(5);
  });
  assert.equal(view.root.findByType(QuotationSelect).props.value, "תדיראן");
  await act(async (): Promise<void> => {
    submit();
    await settle(5);
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
