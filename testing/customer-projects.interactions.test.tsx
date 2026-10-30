import {
  stages,
  STAGE_ID,
  createUser,
  CUSTOMER_ID,
  createClient,
  createCustomer,
  createNodeMock,
  OTHER_STAGE_ID,
  createRelatedPage,
  OTHER_CUSTOMER_ID,
  createRelatedProject,
} from "./customer-projects.fixture";

import { test, after } from "node:test";
import assert from "node:assert/strict";
import Tabs from "../src/components/Tabs/Tabs";
import { useState, type ReactNode } from "react";
import { act, create } from "react-test-renderer";
import Button from "../src/components/Button/Button";
import { AxiosError, type AxiosResponse } from "axios";
import { setSession } from "../src/store/session.store";
import { queryClient } from "../src/providers/query-client";
import TextField from "../src/components/TextField/TextField";
import DataTable from "../src/components/DataTable/DataTable";
import CustomerPage from "../src/pages/customer/CustomerPage";
import { httpClient } from "../src/services/http-client.service";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { PERMISSIONS } from "../src/constants/permission.constant";
import { useScrollReached } from "../src/hooks/scroll-reached.hook";
import { SEARCH_DEBOUNCE_MS } from "../src/constants/search.constant";
import LoadingState from "../src/components/LoadingState/LoadingState";
import Autocomplete from "../src/components/Autocomplete/Autocomplete";
import { ALL_STAGES_TILE_ID } from "../src/constants/stage-tile.constant";
import ProjectStageCell from "../src/pages/board/columns/cells/ProjectStageCell";
import { CUSTOMER_PROJECT_COPY } from "../src/constants/customer-project.constant";
import CustomerDetailsCard from "../src/pages/customer/components/CustomerDetailsCard";
import { MemoryRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import CustomerProjectsCard from "../src/pages/customer/components/CustomerProjectsCard";
import { CUSTOMER_CONTACT_QUERY_ROOT } from "../src/constants/customer-contact.constant";
import type { ICustomerProjectPage } from "../src/interfaces/customer-project.interface";
import CustomerProjectsError from "../src/pages/customer/components/CustomerProjectsError";
import { QueryClientProvider, notifyManager, type QueryClient } from "@tanstack/react-query";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
notifyManager.setScheduler(queueMicrotask);
after(() => notifyManager.setScheduler(callback => setTimeout(callback, 0)));

const flush = () => new Promise<void>(resolve => setImmediate(resolve));
const plainText = (renderer: ReturnType<typeof create>) => JSON.stringify(renderer.toJSON());
const seedPage = (client: QueryClient, page: ICustomerProjectPage, stageId: string | null = null) =>
  client.setQueryData(QUERY_KEYS.customerProjects(CUSTOMER_ID, { search: "", stageId }), {
    pages: [page],
    pageParams: [null],
  });

const LocationProbe = () => <output data-location>{useLocation().pathname}</output>;
const CustomerNavigation = () => {
  const navigate = useNavigate();
  return (
    <button data-go onClick={() => navigate(`/customers/${OTHER_CUSTOMER_ID}`)}>
      navigate
    </button>
  );
};

const mount = async (client: QueryClient, content: ReactNode) => {
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  await act(async () => {
    state.renderer = create(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[`/customers/${CUSTOMER_ID}`]}>
          {content}
          <LocationProbe />
        </MemoryRouter>
      </QueryClientProvider>,
      { createNodeMock },
    );
    await flush();
  });
  const renderer = state.renderer;
  assert.ok(renderer);
  return renderer;
};

test("a customer-only reader sees customer details but never mounts or requests project data, even for an admin role", async () => {
  const client = createClient();
  const requests: string[] = [];
  const original = httpClient.defaults.adapter;
  httpClient.defaults.adapter = async config => {
    requests.push(config.url ?? "");
    return { config, status: 200, statusText: "OK", headers: {}, data: createRelatedPage() };
  };
  setSession({ accessToken: "test-token", user: createUser([PERMISSIONS.CUSTOMERS_READ]) });
  const renderer = await mount(
    client,
    <Routes>
      <Route element={<CustomerPage />} path="/customers/:customerId" />
    </Routes>,
  );
  try {
    assert.equal(renderer.root.findAllByType(CustomerDetailsCard).length, 1);
    assert.equal(renderer.root.findAllByType(CustomerProjectsCard).length, 0);
    assert.equal(requests.filter(url => url.endsWith("/projects")).length, 0);
    await act(async () => {
      setSession({ accessToken: "test-token", user: createUser() });
      await flush();
    });
    assert.equal(renderer.root.findAllByType(CustomerProjectsCard).length, 1);
    assert.equal(requests.filter(url => url.endsWith("/projects")).length, 1);
    await act(async () =>
      setSession({ accessToken: "test-token", user: createUser([PERMISSIONS.CUSTOMERS_READ]) }),
    );
    assert.equal(renderer.root.findAllByType(CustomerProjectsCard).length, 0);
  } finally {
    await act(async () => renderer.unmount());
    httpClient.defaults.adapter = original;
    client.clear();
    setSession(null);
  }
});

test("an initial list error keeps customer details visible and Retry recovers only the list", async () => {
  const client = createClient();
  const state = { failed: true, calls: 0 };
  const original = httpClient.defaults.adapter;
  httpClient.defaults.adapter = async config => {
    state.calls += 1;
    if (state.failed) {
      throw new AxiosError("temporary", "ERR_BAD_RESPONSE", config, null, {
        config,
        status: 503,
        statusText: "Unavailable",
        headers: {},
        data: { message: "temporary" },
      });
    }

    return { config, status: 200, statusText: "OK", headers: {}, data: createRelatedPage() };
  };
  setSession({ accessToken: "test-token", user: createUser() });
  const renderer = await mount(
    client,
    <Routes>
      <Route element={<CustomerPage />} path="/customers/:customerId" />
    </Routes>,
  );
  try {
    assert.equal(renderer.root.findByType(CustomerDetailsCard).props.customer.id, CUSTOMER_ID);
    assert.equal(renderer.root.findAllByType(CustomerProjectsError).length, 1);
    assert.equal(renderer.root.findAllByType(DataTable).length, 0);
    state.failed = false;
    await act(async () => {
      await renderer.root.findByType(CustomerProjectsError).props.onRetry();
      await flush();
    });
    assert.equal(renderer.root.findAllByType(CustomerProjectsError).length, 0);
    assert.equal(renderer.root.findByType(DataTable).props.rows.length, 1);
    assert.equal(state.calls, 2);
    assert.equal(renderer.root.findByType(CustomerDetailsCard).props.customer.id, CUSTOMER_ID);
  } finally {
    await act(async () => renderer.unmount());
    httpClient.defaults.adapter = original;
    client.clear();
    setSession(null);
  }
});

test("loading project data leaves the customer details usable and never presents a false empty state", async () => {
  const client = createClient();
  const request: { complete: (() => void) | null } = { complete: null };
  const original = httpClient.defaults.adapter;
  httpClient.defaults.adapter = config =>
    new Promise<AxiosResponse<unknown>>(resolve => {
      request.complete = () =>
        resolve({ config, status: 200, statusText: "OK", headers: {}, data: createRelatedPage() });
    });
  setSession({ accessToken: "test-token", user: createUser() });
  const renderer = await mount(
    client,
    <Routes>
      <Route element={<CustomerPage />} path="/customers/:customerId" />
    </Routes>,
  );
  try {
    assert.equal(renderer.root.findByType(CustomerDetailsCard).props.customer.id, CUSTOMER_ID);
    assert.equal(renderer.root.findAllByType(LoadingState).length, 1);
    assert.equal(renderer.root.findAllByType(DataTable).length, 0);
    assert.ok(!plainText(renderer).includes(CUSTOMER_PROJECT_COPY.EMPTY));
    assert.ok(request.complete);
    await act(async () => {
      request.complete?.();
      await flush();
    });
    assert.equal(renderer.root.findAllByType(LoadingState).length, 0);
    assert.equal(renderer.root.findByType(DataTable).props.rows.length, 1);
  } finally {
    request.complete?.();
    await act(async () => renderer.unmount());
    httpClient.defaults.adapter = original;
    client.clear();
    setSession(null);
  }
});

test("empty customer and empty status-filter results have distinct recovery states", async () => {
  const client = createClient();
  seedPage(client, createRelatedPage({ items: [], total: 0, counts: { total: 0, byStage: {} } }));
  seedPage(
    client,
    createRelatedPage({ items: [], total: 3, counts: { total: 3, byStage: { [STAGE_ID]: 3 } } }),
    OTHER_STAGE_ID,
  );
  setSession({ accessToken: "test-token", user: createUser() });
  const renderer = await mount(client, <CustomerProjectsCard customerId={CUSTOMER_ID} />);
  try {
    assert.ok(plainText(renderer).includes(CUSTOMER_PROJECT_COPY.EMPTY));
    await act(async () => renderer.root.findByType(Tabs).props.onChange(OTHER_STAGE_ID));
    assert.ok(plainText(renderer).includes(CUSTOMER_PROJECT_COPY.NO_RESULTS));
    assert.ok(!plainText(renderer).includes(CUSTOMER_PROJECT_COPY.EMPTY));
    const clear = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === CUSTOMER_PROJECT_COPY.CLEAR);
    assert.ok(clear);
    await act(async () => clear.props.onClick());
    assert.equal(renderer.root.findByType(Tabs).props.activeId, ALL_STAGES_TILE_ID);
    assert.ok(plainText(renderer).includes(CUSTOMER_PROJECT_COPY.EMPTY));
  } finally {
    await act(async () => renderer.unmount());
    client.clear();
    setSession(null);
  }
});

test("pagination errors retain loaded rows and Retry resumes the failed cursor instead of restarting the list", async () => {
  const client = createClient();
  const first = createRelatedProject();
  const second = createRelatedProject({ id: "project-2", name: "פרויקט שני" });
  seedPage(
    client,
    createRelatedPage({
      nextCursor: "second-page",
      total: 2,
      counts: { total: 2, byStage: { [STAGE_ID]: 2 } },
    }),
  );
  const state = { failed: true };
  const requests: unknown[] = [];
  const original = httpClient.defaults.adapter;
  httpClient.defaults.adapter = async config => {
    requests.push(config.params);
    if (state.failed) {
      throw new AxiosError("temporary", "ERR_BAD_RESPONSE", config, null, {
        config,
        status: 503,
        statusText: "Unavailable",
        headers: {},
        data: {},
      });
    }

    return {
      config,
      status: 200,
      statusText: "OK",
      headers: {},
      data: createRelatedPage({
        items: [second],
        total: 2,
        counts: { total: 2, byStage: { [STAGE_ID]: 2 } },
      }),
    };
  };
  setSession({ accessToken: "test-token", user: createUser() });
  const renderer = await mount(client, <CustomerProjectsCard customerId={CUSTOMER_ID} />);
  try {
    const more = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === CUSTOMER_PROJECT_COPY.MORE);
    assert.ok(more);
    await act(async () => {
      await more.props.onClick();
      await flush();
    });
    assert.deepEqual(
      renderer.root.findByType(DataTable).props.rows.map((row: { id: string }) => row.id),
      [first.id],
    );
    assert.equal(renderer.root.findAllByType(CustomerProjectsError).length, 1);
    state.failed = false;
    await act(async () => {
      await renderer.root.findByType(CustomerProjectsError).props.onRetry();
      await flush();
    });
    assert.deepEqual(
      renderer.root.findByType(DataTable).props.rows.map((row: { id: string }) => row.id),
      [first.id, second.id],
    );
    assert.deepEqual(requests, [
      { search: null, stageId: null, batchCursor: "second-page", batchSize: 10 },
      { search: null, stageId: null, batchCursor: "second-page", batchSize: 10 },
    ]);
  } finally {
    await act(async () => renderer.unmount());
    httpClient.defaults.adapter = original;
    client.clear();
    setSession(null);
  }
});

test("search/status and customer navigation start new cursor scopes without stale rows or hidden associations", async () => {
  const client = createClient();
  client.setQueryData(QUERY_KEYS.customer(OTHER_CUSTOMER_ID), createCustomer(OTHER_CUSTOMER_ID));
  client.setQueryData([CUSTOMER_CONTACT_QUERY_ROOT, OTHER_CUSTOMER_ID], []);
  const original = httpClient.defaults.adapter;
  const requests: { customer: string; params: unknown }[] = [];
  const previousConsoleError = console.error;
  const duplicateKeyWarnings: string[] = [];
  console.error = (...args: unknown[]) => {
    const message = args.filter(value => typeof value === "string").join(" ");
    if (message.includes("same key")) {
      duplicateKeyWarnings.push(message);
    }

    previousConsoleError(...args);
  };
  httpClient.defaults.adapter = async config => {
    const isOther = (config.url ?? "").includes(OTHER_CUSTOMER_ID);
    const customer = isOther ? OTHER_CUSTOMER_ID : CUSTOMER_ID;
    requests.push({ customer, params: config.params });
    const customerName = isOther ? "פרויקט לקוח אחר" : "פרויקט ראשון";
    const searchName = config.params.search ? "תוצאת חיפוש" : customerName;
    const name = config.params.batchCursor ? "פרויקט מדף שני" : searchName;
    const isUnfiltered = !config.params.search && !config.params.stageId;
    const hasOldCustomerPages = !isOther && isUnfiltered;
    const total = hasOldCustomerPages ? 2 : 1;
    const nextCursor =
      hasOldCustomerPages && !config.params.batchCursor ? "old-customer-page-2" : null;
    const stageId = config.params.stageId ?? STAGE_ID;
    return {
      config,
      status: 200,
      statusText: "OK",
      headers: {},
      data: createRelatedPage({
        total,
        nextCursor,
        counts: { total, byStage: { [stageId]: total } },
        items: [
          createRelatedProject({
            id: name,
            name,
            stageId,
            stage: stages.find(stage => stage.id === stageId) ?? null,
          }),
        ],
      }),
    };
  };
  setSession({ accessToken: "test-token", user: createUser() });
  const renderer = await mount(
    client,
    <>
      <Routes>
        <Route element={<CustomerPage />} path="/customers/:customerId" />
      </Routes>
      <CustomerNavigation />
    </>,
  );
  try {
    const more = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === CUSTOMER_PROJECT_COPY.MORE);
    assert.ok(more);
    await act(async () => {
      await more.props.onClick();
      await flush();
    });
    assert.deepEqual(
      renderer.root.findByType(DataTable).props.rows.map((row: { name: string }) => row.name),
      ["פרויקט ראשון", "פרויקט מדף שני"],
    );
    await act(async () =>
      renderer.root
        .findAllByType(TextField)
        .find(field => field.props.placeholder === CUSTOMER_PROJECT_COPY.SEARCH)
        ?.props.onChange("חיפוש"),
    );
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, SEARCH_DEBOUNCE_MS));
      await flush();
    });
    assert.equal(renderer.root.findByType(DataTable).props.rows[0].name, "תוצאת חיפוש");
    assert.equal(renderer.root.findByType(DataTable).props.rows.length, 1);
    assert.deepEqual(requests.at(-1)?.params, {
      search: "חיפוש",
      stageId: null,
      batchCursor: null,
      batchSize: 8,
    });
    await act(async () => {
      renderer.root.findByType(Tabs).props.onChange(OTHER_STAGE_ID);
      await flush();
    });
    assert.deepEqual(requests.at(-1)?.params, {
      search: "חיפוש",
      stageId: OTHER_STAGE_ID,
      batchCursor: null,
      batchSize: 8,
    });
    await act(async () => {
      renderer.root.findByProps({ "data-go": true }).props.onClick();
      await flush();
    });
    assert.deepEqual(requests.at(-1), {
      customer: OTHER_CUSTOMER_ID,
      params: { search: null, stageId: null, batchCursor: null, batchSize: 8 },
    });
    assert.equal(renderer.root.findByType(DataTable).props.rows[0].name, "פרויקט לקוח אחר");
    assert.equal(renderer.root.findByType(Tabs).props.activeId, ALL_STAGES_TILE_ID);
    assert.equal(
      renderer.root
        .findAllByType(TextField)
        .find(field => field.props.placeholder === CUSTOMER_PROJECT_COPY.SEARCH)?.props.value,
      "",
    );
    assert.deepEqual(duplicateKeyWarnings, []);
  } finally {
    await act(async () => renderer.unmount());
    httpClient.defaults.adapter = original;
    client.clear();
    setSession(null);
    console.error = previousConsoleError;
  }
});

test("status editing follows the existing feature grant and does not navigate the row", async () => {
  queryClient.clear();
  queryClient.setQueryData(QUERY_KEYS.PROJECT_STAGES, stages);
  seedPage(queryClient, createRelatedPage());
  const requests: { url: string; method: string; payload: unknown }[] = [];
  const original = httpClient.defaults.adapter;
  httpClient.defaults.adapter = async config => {
    requests.push({
      url: config.url ?? "",
      method: config.method ?? "",
      payload: config.data ? JSON.parse(config.data) : null,
    });
    const data =
      config.method === "patch"
        ? {}
        : createRelatedPage({
            items: [createRelatedProject({ stageId: OTHER_STAGE_ID, stage: stages[1] })],
          });
    return { config, status: 200, statusText: "OK", headers: {}, data };
  };
  setSession({ accessToken: "test-token", user: createUser() });
  const renderer = await mount(queryClient, <CustomerProjectsCard customerId={CUSTOMER_ID} />);
  try {
    assert.equal(renderer.root.findByType(ProjectStageCell).props.canMove, false);
    assert.equal(renderer.root.findByType(Autocomplete).props.disabled, true);
    await act(async () =>
      setSession({
        accessToken: "test-token",
        user: createUser([
          PERMISSIONS.CUSTOMERS_READ,
          PERMISSIONS.PROJECTS_READ,
          PERMISSIONS.PROJECTS_STATUS_CHANGE,
        ]),
      }),
    );
    assert.equal(renderer.root.findByType(Autocomplete).props.disabled, false);
    await act(async () => {
      renderer.root.findByType(Autocomplete).props.onChange(stages[1].name);
      await flush();
      await flush();
    });
    assert.equal(requests.filter(request => request.method === "patch").length, 1);
    assert.deepEqual(requests.find(request => request.method === "patch")?.payload, {
      stageId: OTHER_STAGE_ID,
    });
    assert.equal(
      renderer.root.findByProps({ "data-location": true }).children[0],
      `/customers/${CUSTOMER_ID}`,
    );
    assert.ok(
      requests.some(request => request.url.endsWith("/projects") && request.method === "get"),
    );
  } finally {
    await act(async () => renderer.unmount());
    httpClient.defaults.adapter = original;
    queryClient.clear();
    setSession(null);
  }
});

interface IIntersectionEntry {
  isIntersecting: boolean;
  rootBounds: { top: number } | null;
  boundingClientRect: { bottom: number };
}

test("scroll observer uses the caller's bounded root and disconnects when root or enabled state changes", async () => {
  const previous = Reflect.get(globalThis, "IntersectionObserver");
  const hadObserver = Reflect.has(globalThis, "IntersectionObserver");
  const observations: {
    options: { root?: unknown };
    disconnected: boolean;
    trigger: (entries: IIntersectionEntry[]) => void;
  }[] = [];
  class TestObserver {
    state: (typeof observations)[number];
    constructor(callback: (entries: IIntersectionEntry[]) => void, options: { root?: unknown }) {
      this.state = { options, disconnected: false, trigger: callback };
      observations.push(this.state);
    }
    observe() {}
    disconnect() {
      this.state.disconnected = true;
    }
  }
  Reflect.set(globalThis, "IntersectionObserver", TestObserver);
  const calls: number[] = [];
  const Harness = ({ enabled }: { enabled: boolean }) => {
    const [root, setRoot] = useState<Element | null>(null);
    const ref = useScrollReached({
      root,
      isEnabled: enabled,
      onReach: () => {
        calls.push(1);
      },
    });
    return <section ref={ref} data-set-root={setRoot} />;
  };
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  try {
    await act(async () => {
      state.renderer = create(<Harness enabled />, {
        createNodeMock: () => ({ nodeName: "SECTION" }),
      });
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    const initial = observations.at(-1);
    assert.ok(initial);
    const boundedRoot = { nodeName: "DIV" };
    await act(async () => renderer.root.findByType("section").props["data-set-root"](boundedRoot));
    assert.equal(initial.disconnected, true);
    const current = observations.at(-1);
    assert.ok(current);
    assert.equal(current.options.root, boundedRoot);
    current.trigger([
      { isIntersecting: false, boundingClientRect: { bottom: 20 }, rootBounds: { top: 0 } },
    ]);
    assert.deepEqual(calls, []);
    current.trigger([
      { isIntersecting: true, boundingClientRect: { bottom: 20 }, rootBounds: { top: 0 } },
    ]);
    assert.deepEqual(calls, [1]);
    await act(async () => renderer.update(<Harness enabled={false} />));
    assert.equal(current.disconnected, true);
  } finally {
    await act(async () => state.renderer?.unmount());
    Reflect.set(globalThis, "IntersectionObserver", previous);
    if (!hadObserver) {
      Reflect.deleteProperty(globalThis, "IntersectionObserver");
    }
  }
});
