import {
  isPublicationPending,
  publicationPollInterval,
} from "../src/utilities/quotation-publication.utility";

import {
  PUBLICATION_COPY,
  PUBLICATION_POLL,
  PUBLICATION_KIND,
  PUBLICATION_STATE,
} from "../src/constants/quotation-publication.constant";

import type {
  IQuotationPublication,
  IQuotationPublicationState,
} from "../src/interfaces/quotation-publication.interface";

import {
  isPublicationUrl,
  isQuotationPublication,
} from "../src/utilities/guards/quotation-publication.guard";

import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import { quotationFixture } from "./quotation.fixture";
import { renderToStaticMarkup } from "react-dom/server";
import { setSession } from "../src/store/session.store";
import { logger } from "../src/utilities/logger.utility";
import { TIME_UNITS } from "../src/constants/time.constant";
import { setTimeout as settle } from "node:timers/promises";
import type { ReactTestRenderer } from "react-test-renderer";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { PERMISSIONS } from "../src/constants/permission.constant";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { IApiAuthorizedUser } from "../src/interfaces/api.interface";
import { SessionRequestManager } from "../src/managers/session-request.manager";
import { useQuotationPublication } from "../src/hooks/quotation-publication.hook";
import { quotationLifecycleTimeline } from "../src/utilities/quotation-lifecycle.utility";
import { quotationPublicationService } from "../src/services/quotation-publication.service";
import { QUOTATION_STATUS, QUOTATION_LIFECYCLE_ACTION } from "../src/constants/quotation.constant";
import QuotationPublicationNotice from "../src/pages/quotations/components/QuotationPublicationNotice";

interface IPublicationTestState {
  state: IQuotationPublicationState | null;
}
interface IPublicationTestMount {
  client: QueryClient;
  renderer: ReactTestRenderer;
  current: IPublicationTestState;
}
interface IPublicationTestRenderer {
  renderer: ReactTestRenderer | null;
}
interface IDeferredPublication {
  resolve: ((value: IQuotationPublication) => void) | null;
}

const PUBLICATION_TEST_SETTLEMENT_MS = 0.001 * TIME_UNITS.SECOND_MS;

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
const user: IApiAuthorizedUser = {
  id: "reader",
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  employeeNumber: "",
  deletedAt: null,
  role: USER_ROLES.SECRETARY,
  assignedRoles: [USER_ROLES.SECRETARY],
  permissions: [PERMISSIONS.QUOTATIONS_READ],
};
const summary = (changes: Partial<IQuotationPublication> = {}): IQuotationPublication => ({
  cycleId: "cycle",
  generation: 1,
  documentKind: PUBLICATION_KIND.QUOTATION,
  sourceVersion: 2,
  state: PUBLICATION_STATE.FAILED,
  reason: "נדרש תיקון תיקייה",
  updatedAt: "2026-11-23T12:00:00Z",
  destinationLabel: "הצעות מחיר",
  fileUrl: null,
  canRetry: true,
  history: [],
  ...changes,
});
const mount = async (): Promise<IPublicationTestMount> => {
  const current: IPublicationTestState = { state: null };
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const Capture = (): null => {
    current.state = useQuotationPublication("quotation", 2);
    return null;
  };
  const holder: IPublicationTestRenderer = { renderer: null };
  await act(async (): Promise<void> => {
    holder.renderer = create(
      <QueryClientProvider client={client}>
        <Capture />
      </QueryClientProvider>,
    );
    await settle(PUBLICATION_TEST_SETTLEMENT_MS);
  });
  await act(async (): Promise<void> => {
    await settle(PUBLICATION_TEST_SETTLEMENT_MS);
  });
  assert.ok(holder.renderer);
  return { renderer: holder.renderer, client, current };
};
const cleanup = async (renderer: ReactTestRenderer, client: QueryClient): Promise<void> => {
  await act(async (): Promise<void> => renderer.unmount());
  client.clear();
  mock.restoreAll();
  setSession(null);
};

test("publication boundary rejects unsafe file links and invalid states", (): void => {
  assert.equal(isQuotationPublication(summary()), true);
  assert.equal(isQuotationPublication({ ...summary(), state: "secret-job" }), false);
  assert.equal(isPublicationUrl("javascript:alert(1)"), false);
  assert.equal(isPublicationUrl("https://drive.google.com.evil.test/file/d/id/view"), false);
  assert.equal(isPublicationUrl("https://drive.google.com/file/d/id/view"), true);
  assert.equal(isPublicationUrl(null), true);
});
test("polling applies only to pending states", (): void => {
  const pending = [
    PUBLICATION_STATE.QUEUED,
    PUBLICATION_STATE.RENDERING,
    PUBLICATION_STATE.PUBLISHING,
    PUBLICATION_STATE.ARCHIVING,
    PUBLICATION_STATE.RECONCILING,
  ];
  Object.values(PUBLICATION_STATE).forEach((state): void => {
    assert.equal(
      isPublicationPending(state),
      pending.some((value): boolean => value === state),
    );
  });
});
test("publication details augment original lifecycle entry without extra timeline rows", (): void => {
  const quotation = quotationFixture();
  const occurredAt = "2026-11-23T12:00:00Z";
  quotation.lifecycleHistory = [
    {
      id: "event",
      actorId: "actor",
      actorName: "Dana",
      occurredAt,
      quotationId: quotation.id,
      quotationVersion: 2,
      fromStatus: QUOTATION_STATUS.DRAFT,
      toStatus: QUOTATION_STATUS.REVIEW,
      action: QUOTATION_LIFECYCLE_ACTION.SUBMIT,
      reason: null,
    },
  ];
  const publication = summary({
    history: [
      {
        cycleId: "cycle",
        generation: 1,
        documentKind: PUBLICATION_KIND.QUOTATION,
        sourceVersion: 2,
        state: PUBLICATION_STATE.PUBLISHED,
        reason: null,
        updatedAt: occurredAt,
        destinationLabel: "הצעות מחיר",
        fileUrl: "https://drive.google.com/file/d/id/view",
        lifecycleEventId: "event",
      },
    ],
  });
  const entries = quotationLifecycleTimeline(quotation, publication);
  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.author, "Dana");
  assert.match(entries[0]?.detail ?? "", /גרסה 2/);
  assert.match(entries[0]?.fileLink?.label ?? "", /הגרסה הנוכחית/);
});
test("retry sends only expected cycle and generation and suppresses duplicate clicks", async (): Promise<void> => {
  setSession({ user, accessToken: "local-test-token" });
  mock.method(quotationPublicationService, "get", async (): Promise<IQuotationPublication> =>
    summary(),
  );
  const deferred: IDeferredPublication = { resolve: null };
  const response = new Promise<IQuotationPublication>((resolve): void => {
    deferred.resolve = resolve;
  });
  const retry = mock.method(
    quotationPublicationService,
    "retry",
    async (): Promise<IQuotationPublication> => response,
  );
  const mounted = await mount();
  try {
    await act(async (): Promise<void> => {
      const first = mounted.current.state?.retry();
      const second = mounted.current.state?.retry();
      await settle(PUBLICATION_TEST_SETTLEMENT_MS);
      assert.equal(retry.mock.callCount(), 1);
      assert.deepEqual(retry.mock.calls[0]?.arguments, [
        "quotation",
        { cycleId: "cycle", generation: 1 },
      ]);
      deferred.resolve?.(summary({ state: PUBLICATION_STATE.PUBLISHED, canRetry: false }));
      await first;
      await second;
    });
    await act(async (): Promise<void> => {
      await settle(PUBLICATION_TEST_SETTLEMENT_MS);
    });
    assert.equal(mounted.current.state?.publication?.state, PUBLICATION_STATE.PUBLISHED);
  } finally {
    await cleanup(mounted.renderer, mounted.client);
  }
});
test("authorization switch discards stale summary and disables retained retry handler", async (): Promise<void> => {
  setSession({ user, accessToken: "first-local-token" });
  mock.method(logger, "error", (): void => {});
  const deferred: IDeferredPublication = { resolve: null };
  const response = new Promise<IQuotationPublication>((resolve): void => {
    deferred.resolve = resolve;
  });
  mock.method(
    quotationPublicationService,
    "get",
    async (): Promise<IQuotationPublication> => response,
  );
  const retry = mock.method(
    quotationPublicationService,
    "retry",
    async (): Promise<IQuotationPublication> => summary(),
  );
  const mounted = await mount();
  const retainedRetry = mounted.current.state?.retry;
  try {
    await act(async (): Promise<void> => {
      SessionRequestManager.invalidateAuthorization();
      setSession(null);
      deferred.resolve?.(summary());
      await settle(PUBLICATION_TEST_SETTLEMENT_MS);
    });
    await retainedRetry?.();
    assert.equal(mounted.current.state?.publication, null);
    assert.equal(retry.mock.callCount(), 0);
  } finally {
    await cleanup(mounted.renderer, mounted.client);
  }
});

test("pending polling keeps bounded cadence and recovers through network errors", (): void => {
  assert.equal(
    publicationPollInterval(PUBLICATION_STATE.QUEUED, false),
    PUBLICATION_POLL.INTERVAL_MS,
  );

  assert.equal(
    publicationPollInterval(PUBLICATION_STATE.RENDERING, true),
    PUBLICATION_POLL.RECOVERY_INTERVAL_MS,
  );
  assert.equal(publicationPollInterval(PUBLICATION_STATE.PUBLISHED, false), false);
});
test("retained retry cannot mutate after an authorization change", async (): Promise<void> => {
  setSession({ user, accessToken: "first-local-token" });
  mock.method(quotationPublicationService, "get", async (): Promise<IQuotationPublication> =>
    summary(),
  );
  const retry = mock.method(
    quotationPublicationService,
    "retry",
    async (): Promise<IQuotationPublication> => summary(),
  );
  const mounted = await mount();
  const retainedRetry = mounted.current.state?.retry;
  try {
    assert.equal(mounted.current.state?.publication?.canRetry, true);
    await act(async (): Promise<void> => {
      SessionRequestManager.invalidateAuthorization();
      setSession(null);
    });
    await retainedRetry?.();
    assert.equal(retry.mock.callCount(), 0);
  } finally {
    await cleanup(mounted.renderer, mounted.client);
  }
});

test("initial read failure can be refreshed without mutation permission", async (): Promise<void> => {
  setSession({ user, accessToken: "local-reader-token" });
  mock.method(logger, "error", (): void => {});
  const calls = { count: 0 };
  mock.method(quotationPublicationService, "get", async (): Promise<IQuotationPublication> => {
    calls.count += 1;
    if (calls.count === 1) {
      throw new Error("local read failure");
    }
    return summary({ canRetry: false });
  });
  const mounted = await mount();
  try {
    assert.ok(mounted.current.state?.error);
    await act(async (): Promise<void> => {
      await mounted.current.state?.refresh();
      await settle(PUBLICATION_TEST_SETTLEMENT_MS);
    });
    assert.equal(mounted.current.state?.error, null);
    assert.equal(mounted.current.state?.publication?.canRetry, false);
    assert.equal(calls.count, 2);
  } finally {
    await cleanup(mounted.renderer, mounted.client);
  }
});

test("authorization switch rejects in-flight retry result adoption", async (): Promise<void> => {
  setSession({ user, accessToken: "first-local-token" });
  mock.method(logger, "error", (): void => {});
  mock.method(quotationPublicationService, "get", async (): Promise<IQuotationPublication> =>
    summary(),
  );
  const deferred: IDeferredPublication = { resolve: null };
  const response = new Promise<IQuotationPublication>((resolve): void => {
    deferred.resolve = resolve;
  });
  mock.method(
    quotationPublicationService,
    "retry",
    async (): Promise<IQuotationPublication> => response,
  );
  const mounted = await mount();
  try {
    await act(async (): Promise<void> => {
      const pending = mounted.current.state?.retry();
      await settle(PUBLICATION_TEST_SETTLEMENT_MS);
      SessionRequestManager.invalidateAuthorization();
      setSession(null);
      deferred.resolve?.(
        summary({
          state: PUBLICATION_STATE.PUBLISHED,
          fileUrl: "https://drive.google.com/file/d/id/view",
        }),
      );
      await pending;
    });
    assert.equal(mounted.current.state?.publication, null);
  } finally {
    await cleanup(mounted.renderer, mounted.client);
  }
});

test("failed retry renders recoverable error and neutral Refresh adopts published state", async (): Promise<void> => {
  setSession({
    user: { ...user, permissions: [...user.permissions, PERMISSIONS.QUOTATIONS_UPDATE] },
    accessToken: "local-mutation-token",
  });
  mock.method(logger, "error", (): void => {});
  const reads = { count: 0 };
  mock.method(quotationPublicationService, "get", async (): Promise<IQuotationPublication> => {
    reads.count += 1;
    if (reads.count === 1) {
      return summary();
    }
    return summary({
      state: PUBLICATION_STATE.PUBLISHED,
      canRetry: false,
      reason: null,
      fileUrl: "https://drive.google.com/file/d/id/view",
    });
  });
  const retry = mock.method(
    quotationPublicationService,
    "retry",
    async (): Promise<IQuotationPublication> => {
      throw new Error("local rejected retry");
    },
  );
  const mounted = await mount();
  try {
    await act(async (): Promise<void> => {
      await mounted.current.state?.retry();
      await settle(PUBLICATION_TEST_SETTLEMENT_MS);
    });
    const failedState = mounted.current.state;
    assert.ok(failedState);
    assert.equal(failedState.error, PUBLICATION_COPY.RETRY_ERROR);
    assert.equal(failedState.busy, false);
    assert.equal(failedState.refreshing, false);
    const failedMarkup = renderToStaticMarkup(<QuotationPublicationNotice {...failedState} />);
    assert.ok(failedMarkup.includes(PUBLICATION_COPY.RETRY_ERROR));
    const buttons = [...failedMarkup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
    [PUBLICATION_COPY.RETRY, PUBLICATION_COPY.REFRESH].forEach((label): void => {
      const button = buttons.find((match): boolean => (match[2] ?? "").includes(label));
      assert.ok(button, `Expected visible action: ${label}`);
      assert.doesNotMatch(button[1] ?? "", /\bdisabled(?:=|\s|$)/);
    });
    await act(async (): Promise<void> => {
      await mounted.current.state?.refresh();
      await settle(PUBLICATION_TEST_SETTLEMENT_MS);
    });
    const recoveredState = mounted.current.state;
    assert.ok(recoveredState);
    assert.equal(recoveredState.error, null);
    assert.equal(recoveredState.publication?.state, PUBLICATION_STATE.PUBLISHED);
    const recoveredMarkup = renderToStaticMarkup(
      <QuotationPublicationNotice {...recoveredState} />,
    );
    assert.equal(recoveredMarkup.includes(PUBLICATION_COPY.RETRY_ERROR), false);
    assert.ok(recoveredMarkup.includes(PUBLICATION_COPY.OPEN));
    assert.equal(retry.mock.callCount(), 1);
    assert.equal(reads.count, 2);
  } finally {
    await cleanup(mounted.renderer, mounted.client);
  }
});
