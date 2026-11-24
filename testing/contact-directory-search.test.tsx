import { useEffect } from "react";
import assert from "node:assert/strict";
import type { InternalAxiosRequestConfig } from "axios";
import { test, mock, type TestContext } from "node:test";
import { httpClient } from "../src/services/http-client.service";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { SEARCH_DEBOUNCE_MS } from "../src/constants/search.constant";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { contactDirectoryService } from "../src/services/contact-directory.service";
import type { ICustomerContact } from "../src/interfaces/customer-contact.interface";
import { useContactDirectorySearch } from "../src/hooks/queries/contact-directory.query";
import type { IContactDirectorySearchOptions } from "../src/interfaces/contact-directory-search.interface";

type TSearchResult = ReturnType<typeof useContactDirectorySearch>;

interface ISearchSnapshot {
  current: TSearchResult | null;
}

interface ISearchHarnessProps {
  input: IContactDirectorySearchOptions;
  onSnapshot: (result: TSearchResult) => void;
}

const CONTACT: ICustomerContact = {
  id: "contact-search-result",
  name: "איש קשר בדיקה",
  role: null,
  phone: null,
  customerId: null,
  email: "search@example.test",
};

const EMPTY_SEARCH = { search: "" };

const SearchHarness = ({ input, onSnapshot }: ISearchHarnessProps) => {
  const result = useContactDirectorySearch(input);
  useEffect(() => onSnapshot(result), [result, onSnapshot]);
  return null;
};

const advance = async (context: TestContext, milliseconds = 0): Promise<void> => {
  await act(async () => context.mock.timers.tick(milliseconds));
  await act(async () => context.mock.timers.tick(0));
};

const mountSearch = async (
  inputs: IContactDirectorySearchOptions[] = [EMPTY_SEARCH],
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
) => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const snapshots: ISearchSnapshot[] = inputs.map(() => ({ current: null }));
  const render = (values: IContactDirectorySearchOptions[]) => (
    <QueryClientProvider client={client}>
      {values.map((input, index) => (
        <SearchHarness
          key={index}
          input={input}
          onSnapshot={result => {
            snapshots[index].current = result;
          }}
        />
      ))}
    </QueryClientProvider>
  );
  const view: { renderer: ReactTestRenderer | null } = { renderer: null };
  await act(async () => {
    view.renderer = create(render(inputs));
  });
  const renderer = view.renderer;
  assert.ok(renderer);
  const update = async (values: IContactDirectorySearchOptions[]): Promise<void> => {
    await act(async () => renderer.update(render(values)));
  };
  const read = (index = 0): TSearchResult => {
    const snapshot = snapshots[index].current;
    assert.ok(snapshot);
    return snapshot;
  };
  const unmount = async (): Promise<void> => {
    await act(async () => renderer.unmount());
    client.clear();
  };
  return { read, update, unmount };
};

test("empty, whitespace and disabled searches expose no cached directory list or retry request", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const request = mock.method(contactDirectoryService, "search", async () => [CONTACT]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  client.setQueryData(QUERY_KEYS.contactDirectory(""), [CONTACT]);
  const harness = await mountSearch([EMPTY_SEARCH], client);
  try {
    assert.equal(harness.read().showPrompt, true);
    assert.equal(harness.read().isLoading, false);
    assert.deepEqual(harness.read().contacts, []);
    await act(async () => harness.read().refresh());
    await harness.update([{ search: "   " }]);
    await advance(context, SEARCH_DEBOUNCE_MS);
    await harness.update([{ search: "אדריכל", enabled: false }]);
    await advance(context, SEARCH_DEBOUNCE_MS);
    await act(async () => harness.read().refresh());
    assert.equal(request.mock.callCount(), 0);
    assert.equal(harness.read().isReady, false);
    assert.equal(harness.read().isLoading, false);
    assert.equal(harness.read().errorMessage, null);
    assert.deepEqual(harness.read().contacts, []);
  } finally {
    await harness.unmount();
    request.mock.restore();
  }
});

test("rapid typing fetches only the settled normalized query after the full debounce", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const queries: string[] = [];
  const request = mock.method(contactDirectoryService, "search", async (search: string) => {
    queries.push(search);
    return [CONTACT];
  });
  const harness = await mountSearch();
  try {
    await harness.update([{ search: "א" }]);
    await advance(context, SEARCH_DEBOUNCE_MS / 2);
    assert.deepEqual(queries, []);
    await harness.update([{ search: "  אדריכל  " }]);
    await advance(context, SEARCH_DEBOUNCE_MS / 2);
    assert.deepEqual(queries, []);
    assert.equal(harness.read().isLoading, true);
    await advance(context, SEARCH_DEBOUNCE_MS / 2);
    assert.deepEqual(queries, ["אדריכל"]);
    assert.deepEqual(harness.read().contacts, [CONTACT]);
    await harness.update([{ search: "אדריכל" }]);
    await advance(context, SEARCH_DEBOUNCE_MS);
    assert.deepEqual(queries, ["אדריכל"]);
  } finally {
    await harness.unmount();
    request.mock.restore();
  }
});

test("clearing cancels the debounce and aborts an in-flight transport without exposing late results", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const pending = Promise.withResolvers<ICustomerContact[]>();
  const signals: AbortSignal[] = [];
  const request = mock.method(
    contactDirectoryService,
    "search",
    async (_search: string, signal?: AbortSignal) => {
      assert.ok(signal);
      signals.push(signal);
      return pending.promise;
    },
  );
  const harness = await mountSearch();
  try {
    await harness.update([{ search: "טרם חיפוש" }]);
    await advance(context, SEARCH_DEBOUNCE_MS / 2);
    await harness.update([EMPTY_SEARCH]);
    await advance(context, SEARCH_DEBOUNCE_MS);
    assert.equal(request.mock.callCount(), 0);
    await harness.update([{ search: "יועץ" }]);
    await advance(context, SEARCH_DEBOUNCE_MS);
    assert.equal(request.mock.callCount(), 1);
    assert.equal(signals[0].aborted, false);
    await harness.update([{ search: " " }]);
    assert.equal(signals[0].aborted, true);
    assert.equal(harness.read().showPrompt, true);
    assert.equal(harness.read().isLoading, false);
    await act(async () => pending.resolve([CONTACT]));
    await advance(context);
    await act(async () => harness.read().refresh());
    assert.deepEqual(harness.read().contacts, []);
    assert.equal(harness.read().errorMessage, null);
    assert.equal(request.mock.callCount(), 1);
  } finally {
    pending.resolve([]);
    await harness.unmount();
    request.mock.restore();
  }
});

[
  {
    name: "results",
    finish: (pending: PromiseWithResolvers<ICustomerContact[]>) => pending.resolve([CONTACT]),
  },
  {
    name: "errors",
    finish: (pending: PromiseWithResolvers<ICustomerContact[]>) =>
      pending.reject(new Error("Detached directory failure")),
  },
].forEach(scenario =>
  test(`late ${scenario.name} from a cancelled query cannot replace the current contacts`, async context => {
    context.mock.timers.enable({ apis: ["setTimeout"] });
    const previous = Promise.withResolvers<ICustomerContact[]>();
    const current = Promise.withResolvers<ICustomerContact[]>();
    const request = mock.method(contactDirectoryService, "search", async (search: string) =>
      search === "ישן" ? previous.promise : current.promise,
    );
    const harness = await mountSearch([{ search: "ישן" }]);
    const currentContact = { ...CONTACT, id: "current-contact", name: "תוצאה עדכנית" };
    try {
      await harness.update([{ search: "חדש" }]);
      assert.deepEqual(harness.read().contacts, []);
      await advance(context, SEARCH_DEBOUNCE_MS);
      await act(async () => current.resolve([currentContact]));
      await advance(context);
      assert.deepEqual(harness.read().contacts, [currentContact]);
      await act(async () => scenario.finish(previous));
      await advance(context);
      assert.deepEqual(harness.read().contacts, [currentContact]);
      assert.equal(harness.read().errorMessage, null);
    } finally {
      previous.resolve([]);
      current.resolve([]);
      await harness.unmount();
      request.mock.restore();
    }
  }),
);

test("changing input immediately hides prior successful results and errors before the next debounce", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const queries: string[] = [];
  const request = mock.method(contactDirectoryService, "search", async (search: string) => {
    queries.push(search);
    if (search === "נכשל") {
      throw new Error("Directory unavailable");
    }

    return [CONTACT];
  });
  const harness = await mountSearch([{ search: "קיים" }]);
  try {
    await advance(context);
    assert.deepEqual(harness.read().contacts, [CONTACT]);
    await harness.update([{ search: "נכשל" }]);
    assert.deepEqual(harness.read().contacts, []);
    assert.equal(harness.read().errorMessage, null);
    assert.equal(harness.read().isLoading, true);
    await advance(context, SEARCH_DEBOUNCE_MS);
    assert.notEqual(harness.read().errorMessage, null);
    await harness.update([{ search: "לא נשלח" }]);
    assert.equal(harness.read().errorMessage, null);
    assert.deepEqual(harness.read().contacts, []);
    await harness.update([EMPTY_SEARCH]);
    await advance(context, SEARCH_DEBOUNCE_MS);
    await act(async () => harness.read().refresh());
    assert.deepEqual(queries, ["קיים", "נכשל"]);
    assert.equal(harness.read().showPrompt, true);
    assert.equal(harness.read().errorMessage, null);
  } finally {
    await harness.unmount();
    request.mock.restore();
  }
});

test("a current failed query can be retried without permitting refresh after clearing", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const attempts = { count: 0 };
  const request = mock.method(contactDirectoryService, "search", async () => {
    attempts.count += 1;
    if (attempts.count === 1) {
      throw new Error("Retry directory lookup");
    }

    return [CONTACT];
  });
  const harness = await mountSearch([{ search: "איש קשר" }]);
  try {
    await advance(context);
    assert.notEqual(harness.read().errorMessage, null);
    await act(async () => harness.read().refresh());
    await advance(context);
    assert.equal(attempts.count, 2);
    assert.deepEqual(harness.read().contacts, [CONTACT]);
    assert.equal(harness.read().errorMessage, null);
    await harness.update([EMPTY_SEARCH]);
    await act(async () => harness.read().refresh());
    assert.equal(attempts.count, 2);
    assert.deepEqual(harness.read().contacts, []);
  } finally {
    await harness.unmount();
    request.mock.restore();
  }
});

test("simultaneous consumers deduplicate the same normalized search and cancel only after both detach", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const pending = Promise.withResolvers<ICustomerContact[]>();
  const signals: AbortSignal[] = [];
  const request = mock.method(
    contactDirectoryService,
    "search",
    async (_search: string, signal?: AbortSignal) => {
      assert.ok(signal);
      signals.push(signal);
      return pending.promise;
    },
  );
  const harness = await mountSearch([EMPTY_SEARCH, EMPTY_SEARCH]);
  try {
    await harness.update([{ search: " יועץ " }, { search: "יועץ" }]);
    await advance(context, SEARCH_DEBOUNCE_MS);
    assert.equal(request.mock.callCount(), 1);
    await harness.update([EMPTY_SEARCH, { search: "יועץ" }]);
    assert.equal(signals[0].aborted, false);
    await act(async () => pending.resolve([CONTACT]));
    await advance(context);
    assert.deepEqual(harness.read(0).contacts, []);
    assert.deepEqual(harness.read(1).contacts, [CONTACT]);
    assert.equal(request.mock.callCount(), 1);
  } finally {
    pending.resolve([]);
    await harness.unmount();
    request.mock.restore();
  }
});

test("directory service forwards the cancellation signal and search to the HTTP transport", async () => {
  const controller = new AbortController();
  const requests: InternalAxiosRequestConfig[] = [];
  const original = httpClient.defaults.adapter;
  httpClient.defaults.adapter = async config => {
    requests.push(config);
    return { config, status: 200, statusText: "OK", headers: {}, data: [CONTACT] };
  };
  try {
    assert.deepEqual(await contactDirectoryService.search("יועץ", controller.signal), [CONTACT]);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].signal, controller.signal);
    assert.deepEqual(requests[0].params, { search: "יועץ" });
  } finally {
    httpClient.defaults.adapter = original;
  }
});
