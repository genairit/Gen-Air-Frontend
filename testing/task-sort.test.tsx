import {
  TASK_SORTS,
  TASK_SORT_NOTES,
  TASK_SORT_OPTIONS,
} from "../src/constants/task-sort.constant";

import { useEffect } from "react";
import assert from "node:assert/strict";
import { test, mock, type TestContext } from "node:test";
import { taskService } from "../src/services/task.service";
import { createTask, engineer } from "./project-tasks.fixture";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { httpClient } from "../src/services/http-client.service";
import { useMyTasksQuery } from "../src/hooks/queries/task.query";
import { getSession, setSession } from "../src/store/session.store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { retryTaskQueriesAction } from "../src/actions/task-query.action";
import { isTaskSort, toTaskSort } from "../src/utilities/task-sort.utility";
import { API_ENDPOINTS, API_PAGE_SIZE } from "../src/constants/api.constant";
import type { IApiTask, ITaskQuery } from "../src/interfaces/task.interface";
import type { ICursorPage, IApiAuthorizedUser } from "../src/interfaces/api.interface";
import { TASK_STATUSES, TASK_FILTER_IDS, TASKS_PAGE_COPY } from "../src/constants/task.constant";
import { toTaskQuery, toSortedTaskQuery, formatTaskSummary } from "../src/utilities/task.utility";

type TTasksResult = ReturnType<typeof useMyTasksQuery>;

interface ITasksSnapshot {
  current: TTasksResult | null;
}

interface ITasksHarnessProps {
  query: ITaskQuery;
  onSnapshot: (result: TTasksResult) => void;
}

interface ITaskRequest {
  query: ITaskQuery;
  cursor: string | null;
}

const USER: IApiAuthorizedUser = {
  ...engineer,
  permissions: [],
  assignedRoles: [engineer.role],
};

const TASK_ROWS = {
  URGENT_LATE: createTask({ id: "urgent-late", isUrgent: true, dueDate: "2026-12-20T00:00:00Z" }),
  REGULAR_EARLY: createTask({ id: "regular-early", dueDate: "2026-12-01T00:00:00Z" }),
  WITHOUT_DATE: createTask({ id: "without-date", dueDate: null }),
} as const;

const PAGE_CURSORS = { DEFAULT_NEXT: "default-next", ASC_NEXT: "asc-next" } as const;

const toPage = (items: IApiTask[], nextCursor: string | null = null): ICursorPage<IApiTask> => ({
  items,
  nextCursor,
});

const queryFor = (sort: ITaskQuery["sort"]): ITaskQuery =>
  toSortedTaskQuery({
    filterId: TASK_FILTER_IDS.ALL,
    search: "",
    sort: sort ?? TASK_SORTS.DEFAULT,
  });

const toRowIds = (result: TTasksResult): string[] =>
  (result.data?.pages ?? []).flatMap(page => page.items.map(task => task.id));

const TasksHarness = ({ query, onSnapshot }: ITasksHarnessProps) => {
  const result = useMyTasksQuery(query);
  const rowIds = toRowIds(result).join(",");
  const status = result.status;
  useEffect(() => onSnapshot(result), [result, onSnapshot]);
  return <output data-status={status}>{rowIds}</output>;
};

const advance = async (context: TestContext): Promise<void> => {
  await act(async () => context.mock.timers.tick(0));
  await act(async () => context.mock.timers.tick(0));
};

const mountTasks = async (query: ITaskQuery) => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: Infinity } },
  });
  const snapshot: ITasksSnapshot = { current: null };
  const currentQuery = { value: query };
  const view: { renderer: ReactTestRenderer | null } = { renderer: null };
  const render = (input: ITaskQuery) => (
    <QueryClientProvider client={client}>
      <TasksHarness
        query={input}
        onSnapshot={result => {
          snapshot.current = result;
        }}
      />
    </QueryClientProvider>
  );
  await act(async () => {
    setSession({ accessToken: "task-sort-test-token", user: USER });
    view.renderer = create(render(query));
  });
  const renderer = view.renderer;
  assert.ok(renderer);
  const read = (): TTasksResult => {
    assert.ok(snapshot.current);
    return snapshot.current;
  };
  const update = async (input: ITaskQuery): Promise<void> => {
    currentQuery.value = input;
    await act(async () => renderer.update(render(input)));
  };
  const unmount = async (): Promise<void> => {
    await act(async () => {
      renderer.unmount();
      setSession(null);
    });
    client.clear();
  };
  const settle = async (context: TestContext): Promise<void> => {
    const key = QUERY_KEYS.myTasks(getSession()?.user.id ?? null, currentQuery.value);
    const pending = client.getQueryCache().find({ queryKey: key, exact: true })?.promise ?? null;
    await act(async () => {
      await pending;
    });
    await advance(context);
  };
  return { read, update, unmount, settle };
};

test("sort boundary accepts only the three contract modes and keeps a safe default", () => {
  assert.deepEqual(
    TASK_SORT_OPTIONS.map(option => option.value),
    Object.values(TASK_SORTS),
  );
  Object.values(TASK_SORTS).forEach(sort => {
    assert.equal(isTaskSort(sort), true);
    assert.equal(toTaskSort(sort), sort);
  });
  [null, false, 1, "", "due", "due_date_asc "].forEach(value => {
    assert.equal(isTaskSort(value), false);
  });
  assert.equal(toTaskSort("unsupported"), TASK_SORTS.DEFAULT);
});

test("selected order travels with status, urgency and search without changing legacy query construction", () => {
  assert.deepEqual(toTaskQuery(TASK_FILTER_IDS.ALL, ""), {
    search: "",
    status: null,
    isUrgent: null,
  });
  assert.deepEqual(
    toSortedTaskQuery({
      filterId: TASK_FILTER_IDS.URGENT,
      search: "  פרויקט  ",
      sort: TASK_SORTS.DUE_DATE_DESC,
    }),
    { search: "פרויקט", status: null, isUrgent: true, sort: TASK_SORTS.DUE_DATE_DESC },
  );
  assert.deepEqual(
    toSortedTaskQuery({
      filterId: TASK_STATUSES.IN_REVIEW,
      search: "בדיקה",
      sort: TASK_SORTS.DUE_DATE_ASC,
    }),
    {
      search: "בדיקה",
      status: TASK_STATUSES.IN_REVIEW,
      isUrgent: null,
      sort: TASK_SORTS.DUE_DATE_ASC,
    },
  );
});

test("summary states the actual selected ordering instead of always claiming urgency precedence", () => {
  const defaultSummary = formatTaskSummary({ visible: 2, total: 8 });
  assert.ok(defaultSummary.includes(TASKS_PAGE_COPY.ORDER_NOTE));
  assert.ok(defaultSummary.includes("2"));
  assert.ok(defaultSummary.includes("8"));
  [TASK_SORTS.DUE_DATE_ASC, TASK_SORTS.DUE_DATE_DESC].forEach(sort => {
    const summary = formatTaskSummary({ visible: 2, total: 8, sort });
    assert.ok(summary.includes(TASK_SORT_NOTES[sort]));
    assert.equal(summary.includes(TASKS_PAGE_COPY.ORDER_NOTE), false);
    assert.match(summary, /ללא תאריך/);
  });
});

test("task service forwards sort and cursor to the personal endpoint without page-local sorting", async () => {
  const previousAdapter = httpClient.defaults.adapter;
  const page = toPage([TASK_ROWS.URGENT_LATE, TASK_ROWS.REGULAR_EARLY]);
  const requests: { url: string | null; params: unknown }[] = [];
  httpClient.defaults.adapter = async config => {
    requests.push({ url: config.url ?? null, params: config.params });
    return { config, data: page, headers: {}, status: 200, statusText: "OK" };
  };
  try {
    const result = await taskService.getMyTasks(
      { ...queryFor(TASK_SORTS.DUE_DATE_DESC), search: "  פרויקט  " },
      PAGE_CURSORS.DEFAULT_NEXT,
    );
    assert.deepEqual(result, page);
    assert.deepEqual(requests, [
      {
        url: API_ENDPOINTS.MY_TASKS,
        params: {
          status: null,
          isUrgent: null,
          search: "פרויקט",
          sort: TASK_SORTS.DUE_DATE_DESC,
          batchSize: API_PAGE_SIZE,
          batchCursor: PAGE_CURSORS.DEFAULT_NEXT,
        },
      },
    ]);
  } finally {
    httpClient.defaults.adapter = previousAdapter;
  }
});

test("changing mode starts a distinct first-page chain and preserves each server-supplied row order", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const requests: ITaskRequest[] = [];
  const request = mock.method(
    taskService,
    "getMyTasks",
    async (query: ITaskQuery, cursor: string | null) => {
      requests.push({ query, cursor });
      if (query.sort === TASK_SORTS.DUE_DATE_ASC) {
        return toPage([TASK_ROWS.REGULAR_EARLY, TASK_ROWS.URGENT_LATE]);
      }

      if (cursor === PAGE_CURSORS.DEFAULT_NEXT) {
        return toPage([TASK_ROWS.WITHOUT_DATE]);
      }

      return toPage([TASK_ROWS.URGENT_LATE], PAGE_CURSORS.DEFAULT_NEXT);
    },
  );
  const harness = await mountTasks(queryFor(TASK_SORTS.DEFAULT));
  try {
    await harness.settle(context);
    assert.deepEqual(toRowIds(harness.read()), [TASK_ROWS.URGENT_LATE.id]);
    await act(async () => {
      await harness.read().fetchNextPage();
    });
    await harness.settle(context);
    assert.deepEqual(toRowIds(harness.read()), [
      TASK_ROWS.URGENT_LATE.id,
      TASK_ROWS.WITHOUT_DATE.id,
    ]);
    await harness.update(queryFor(TASK_SORTS.DUE_DATE_ASC));
    await harness.settle(context);
    assert.deepEqual(toRowIds(harness.read()), [
      TASK_ROWS.REGULAR_EARLY.id,
      TASK_ROWS.URGENT_LATE.id,
    ]);
    assert.equal(harness.read().data?.pages.length, 1);
    assert.deepEqual(
      requests.map(({ query, cursor }) => ({ sort: query.sort, cursor })),
      [
        { sort: TASK_SORTS.DEFAULT, cursor: null },
        { sort: TASK_SORTS.DEFAULT, cursor: PAGE_CURSORS.DEFAULT_NEXT },
        { sort: TASK_SORTS.DUE_DATE_ASC, cursor: null },
      ],
    );
  } finally {
    await harness.unmount();
    request.mock.restore();
  }
});

test("late first-page responses cannot replace the newly selected mode or its cursor", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const previous = Promise.withResolvers<ICursorPage<IApiTask>>();
  const current = Promise.withResolvers<ICursorPage<IApiTask>>();
  const request = mock.method(taskService, "getMyTasks", async (query: ITaskQuery) =>
    query.sort === TASK_SORTS.DEFAULT ? previous.promise : current.promise,
  );
  const harness = await mountTasks(queryFor(TASK_SORTS.DEFAULT));
  try {
    await harness.update(queryFor(TASK_SORTS.DUE_DATE_ASC));
    assert.deepEqual(toRowIds(harness.read()), []);
    await act(async () =>
      current.resolve(toPage([TASK_ROWS.REGULAR_EARLY], PAGE_CURSORS.ASC_NEXT)),
    );
    await harness.settle(context);
    assert.deepEqual(toRowIds(harness.read()), [TASK_ROWS.REGULAR_EARLY.id]);
    await act(async () =>
      previous.resolve(toPage([TASK_ROWS.URGENT_LATE], PAGE_CURSORS.DEFAULT_NEXT)),
    );
    await harness.settle(context);
    assert.deepEqual(toRowIds(harness.read()), [TASK_ROWS.REGULAR_EARLY.id]);
    assert.equal(harness.read().data?.pages[0].nextCursor, PAGE_CURSORS.ASC_NEXT);
  } finally {
    previous.resolve(toPage([]));
    current.resolve(toPage([]));
    await harness.unmount();
    request.mock.restore();
  }
});

test("an old in-flight load-more page cannot append to another order", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const previousPage = Promise.withResolvers<ICursorPage<IApiTask>>();
  const pending: { fetch: Promise<unknown> | null } = { fetch: null };
  const request = mock.method(
    taskService,
    "getMyTasks",
    async (query: ITaskQuery, cursor: string | null) => {
      if (query.sort === TASK_SORTS.DUE_DATE_DESC) {
        return toPage([TASK_ROWS.REGULAR_EARLY]);
      }

      return cursor
        ? previousPage.promise
        : toPage([TASK_ROWS.URGENT_LATE], PAGE_CURSORS.DEFAULT_NEXT);
    },
  );
  const harness = await mountTasks(queryFor(TASK_SORTS.DEFAULT));
  try {
    await harness.settle(context);
    await act(async () => {
      pending.fetch = harness.read().fetchNextPage();
    });
    await harness.update(queryFor(TASK_SORTS.DUE_DATE_DESC));
    await harness.settle(context);
    assert.equal(
      harness.read().status,
      "success",
      harness.read().error?.message ?? "Pending current sort",
    );
    assert.deepEqual(toRowIds(harness.read()), [TASK_ROWS.REGULAR_EARLY.id]);
    await act(async () => {
      previousPage.resolve(toPage([TASK_ROWS.WITHOUT_DATE]));
      await pending.fetch;
    });
    await harness.settle(context);
    assert.deepEqual(toRowIds(harness.read()), [TASK_ROWS.REGULAR_EARLY.id]);
    assert.equal(harness.read().data?.pages.length, 1);
  } finally {
    previousPage.resolve(toPage([]));
    await harness.unmount();
    request.mock.restore();
  }
});

test("status and search changes retain selected sort while restarting its cursor", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const requests: ITaskRequest[] = [];
  const request = mock.method(
    taskService,
    "getMyTasks",
    async (query: ITaskQuery, cursor: string | null) => {
      requests.push({ query, cursor });
      return toPage([TASK_ROWS.REGULAR_EARLY]);
    },
  );
  const harness = await mountTasks(queryFor(TASK_SORTS.DUE_DATE_ASC));
  try {
    await harness.settle(context);
    const filtered = toSortedTaskQuery({
      filterId: TASK_STATUSES.IN_REVIEW,
      search: "לקוח",
      sort: TASK_SORTS.DUE_DATE_ASC,
    });
    await harness.update(filtered);
    await harness.settle(context);
    assert.deepEqual(requests.at(-1), { query: filtered, cursor: null });
    assert.equal(requests.length, 2);
  } finally {
    await harness.unmount();
    request.mock.restore();
  }
});

test("switching accounts does not display cached rows from the previous user's identical sort", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const nextUser = Promise.withResolvers<ICursorPage<IApiTask>>();
  const calls: string[] = [];
  const request = mock.method(taskService, "getMyTasks", async () => {
    calls.push(getSession()?.user.id ?? "");
    return calls.length === 1 ? toPage([TASK_ROWS.URGENT_LATE]) : nextUser.promise;
  });
  const harness = await mountTasks(queryFor(TASK_SORTS.DUE_DATE_ASC));
  try {
    await harness.settle(context);
    assert.deepEqual(toRowIds(harness.read()), [TASK_ROWS.URGENT_LATE.id]);
    await act(async () =>
      setSession({
        accessToken: "second-task-sort-token",
        user: { ...USER, id: "second-engineer" },
      }),
    );
    assert.deepEqual(toRowIds(harness.read()), []);
    await act(async () => nextUser.resolve(toPage([TASK_ROWS.REGULAR_EARLY])));
    await harness.settle(context);
    assert.deepEqual(toRowIds(harness.read()), [TASK_ROWS.REGULAR_EARLY.id]);
    assert.equal(request.mock.callCount(), 2);
  } finally {
    nextUser.resolve(toPage([]));
    await harness.unmount();
    request.mock.restore();
  }
});

test("retry waits for both current observer queries instead of returning before either finishes", async () => {
  const tasks = Promise.withResolvers<void>();
  const counts = Promise.withResolvers<void>();
  const calls: string[] = [];
  const state = { settled: false };
  const retry = retryTaskQueriesAction({
    refetchTasks: async () => {
      calls.push("tasks");
      await tasks.promise;
    },
    refetchCounts: async () => {
      calls.push("counts");
      await counts.promise;
    },
  }).then(() => {
    state.settled = true;
  });
  assert.deepEqual(calls, ["tasks", "counts"]);
  assert.equal(state.settled, false);
  tasks.resolve();
  await tasks.promise;
  assert.equal(state.settled, false);
  counts.resolve();
  await retry;
  assert.equal(state.settled, true);
});
