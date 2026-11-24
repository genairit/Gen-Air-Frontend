import {
  publicationLabel,
  isPublicationPending,
  publicationDescription,
  publicationPollInterval,
  publicationHistoryDescription,
} from "../src/utilities/quotation-publication.utility";

import {
  PUBLICATION_COPY,
  PUBLICATION_POLL,
  PUBLICATION_KIND,
  PUBLICATION_STATE,
  PUBLICATION_LABELS,
} from "../src/constants/quotation-publication.constant";

import type {
  IQuotationPublication,
  IQuotationPublicationStage,
  IQuotationPublicationState,
} from "../src/interfaces/quotation-publication.interface";

import {
  isPublicationUrl,
  isQuotationPublication,
} from "../src/utilities/guards/quotation-publication.guard";

import { Box } from "@mui/material";
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { getEventListeners } from "node:events";
import { act, create } from "react-test-renderer";
import { Button as MuiButton } from "@mui/material";
import { createRef, type ReactElement } from "react";
import Button from "../src/components/Button/Button";
import { quotationFixture } from "./quotation.fixture";
import { renderToStaticMarkup } from "react-dom/server";
import { setSession } from "../src/store/session.store";
import { logger } from "../src/utilities/logger.utility";
import { TIME_UNITS } from "../src/constants/time.constant";
import { setTimeout as settle } from "node:timers/promises";
import type { ReactTestRenderer } from "react-test-renderer";
import { FOCUS_EVENTS } from "../src/constants/focus.constant";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { PERMISSIONS } from "../src/constants/permission.constant";
import { useFocusFallback } from "../src/hooks/focus-fallback.hook";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { IApiAuthorizedUser } from "../src/interfaces/api.interface";
import { SessionRequestManager } from "../src/managers/session-request.manager";
import { useQuotationPublication } from "../src/hooks/quotation-publication.hook";
import { useEventListener } from "../src/vendor/smartbase/hooks/use-event-listener.hook";
import { quotationLifecycleTimeline } from "../src/utilities/quotation-lifecycle.utility";
import { quotationPublicationService } from "../src/services/quotation-publication.service";
import { registerEventListener } from "../src/vendor/smartbase/utilities/event-listener.utility";
import { QUOTATION_STATUS, QUOTATION_LIFECYCLE_ACTION } from "../src/constants/quotation.constant";
import QuotationPublicationNotice from "../src/pages/quotations/components/QuotationPublicationNotice";

interface IEventListenerFixture {
  enabled: boolean;
  target: EventTarget;
  listener: (event: Event) => void;
}
interface IFocusMockDocument extends EventTarget {
  body: object;
  activeElement: object | null;
}
interface IFocusMockNode extends EventTarget {
  isConnected: boolean;
  focus: HTMLElement["focus"];
  ownerDocument: IFocusMockDocument;
}
interface IFocusMockProps {
  "data-focus-mock"?: string;
}
interface IFocusFixtureProps {
  visible: boolean;
  identity: number;
}

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
      assert.doesNotMatch(button[1] ?? "", /(?:^|\s)disabled(?:=|\s|$)/);
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

test("terminal no-file explanation differs from verified archive in notice and history", (): void => {
  const reason = "ההפקה בוטלה לפני יצירת קובץ";
  const stage: IQuotationPublicationStage = {
    cycleId: "cycle",
    generation: 1,
    documentKind: PUBLICATION_KIND.QUOTATION,
    sourceVersion: 2,
    state: PUBLICATION_STATE.ARCHIVED,
    reason,
    updatedAt: "2026-11-23T12:00:00Z",
    destinationLabel: null,
    fileUrl: null,
    lifecycleEventId: "event",
  };
  const cancelled = summary({
    state: PUBLICATION_STATE.ARCHIVED,
    reason,
    fileUrl: null,
    canRetry: false,
    history: [stage],
  });
  const archived = { ...cancelled, reason: null, history: [{ ...stage, reason: null }] };
  const notice = (publication: IQuotationPublication): string =>
    renderToStaticMarkup(
      <QuotationPublicationNotice
        busy={false}
        error={null}
        refreshing={false}
        publication={publication}
        retry={async (): Promise<void> => {}}
        refresh={async (): Promise<void> => {}}
      />,
    );
  assert.equal(publicationLabel(cancelled), reason);
  assert.equal(publicationLabel(archived), PUBLICATION_LABELS[PUBLICATION_STATE.ARCHIVED]);
  assert.ok(notice(cancelled).includes(reason));
  assert.equal(notice(cancelled).includes(PUBLICATION_LABELS[PUBLICATION_STATE.ARCHIVED]), false);
  assert.ok(notice(archived).includes(PUBLICATION_LABELS[PUBLICATION_STATE.ARCHIVED]));
  assert.ok(publicationHistoryDescription(stage).includes(reason));
  assert.equal(
    publicationHistoryDescription(stage).includes(PUBLICATION_LABELS[PUBLICATION_STATE.ARCHIVED]),
    false,
  );
  assert.ok(
    publicationHistoryDescription({ ...stage, reason: null }).includes(
      PUBLICATION_LABELS[PUBLICATION_STATE.ARCHIVED],
    ),
  );
  assert.equal(publicationDescription(cancelled).includes(reason), false);
  assert.equal(publicationLabel(summary()), PUBLICATION_LABELS[PUBLICATION_STATE.FAILED]);
  assert.ok(publicationDescription(summary()).includes("נדרש תיקון תיקייה"));
});

test("publication retry remains focusable while busy and blocks repeated button activation", async (): Promise<void> => {
  const calls = { count: 0, prevented: 0 };
  const activate = (): void => {
    calls.count += 1;
  };
  const event = {
    preventDefault: (): void => {
      calls.prevented += 1;
    },
  };
  const holder: IPublicationTestRenderer = { renderer: null };
  await act(async (): Promise<void> => {
    holder.renderer = create(
      <Button onClick={activate} focusableWhenDisabled text={PUBLICATION_COPY.RETRY} />,
    );
  });
  const renderer = holder.renderer;
  assert.ok(renderer);
  try {
    await act(async (): Promise<void> => {
      await renderer.root.findByType(MuiButton).props.onClick(event);
    });
    assert.equal(calls.count, 1);
    const host = renderer.root.findByType("button");
    await act(async (): Promise<void> => {
      renderer.update(
        <Button
          disabled
          isLoading
          onClick={activate}
          focusableWhenDisabled
          text={PUBLICATION_COPY.RETRY}
        />,
      );
    });
    const loading = renderer.root.findByType(MuiButton);
    assert.equal(renderer.root.findByType("button"), host);
    assert.equal(host.props.tabIndex, 0);
    assert.equal(loading.props.disabled, false);
    assert.equal(loading.props["aria-disabled"], true);
    assert.equal(loading.props["aria-busy"], true);
    await act(async (): Promise<void> => {
      await loading.props.onClick(event);
    });
    assert.equal(calls.count, 1);
    assert.equal(calls.prevented, 1);
    await act(async (): Promise<void> => {
      renderer.update(
        <Button disabled onClick={activate} focusableWhenDisabled text={PUBLICATION_COPY.RETRY} />,
      );
    });
    const pending = renderer.root.findByType(MuiButton);
    assert.equal(renderer.root.findByType("button"), host);
    assert.equal(host.props.tabIndex, 0);
    assert.equal(pending.props.disabled, false);
    assert.equal(pending.props["aria-disabled"], true);
    assert.equal(pending.props["aria-busy"], false);
    await act(async (): Promise<void> => {
      await pending.props.onClick(event);
    });
    assert.equal(calls.count, 1);
    assert.equal(calls.prevented, 2);
    await act(async (): Promise<void> => {
      renderer.update(<Button disabled onClick={activate} text={PUBLICATION_COPY.RETRY} />);
    });
    assert.equal(renderer.root.findByType(MuiButton).props.disabled, true);
  } finally {
    await act(async (): Promise<void> => renderer.unmount());
  }
});

const FOCUS_REMOVAL_SCENARIOS = {
  TERMINAL: {
    moved: false,
    changedIdentity: false,
    visible: false,
    connected: true,
    unmount: false,
    detachedRef: false,
    departed: false,
    expected: 1,
  },
  MOVED: {
    moved: true,
    changedIdentity: false,
    visible: false,
    connected: true,
    unmount: false,
    detachedRef: false,
    departed: false,
    expected: 0,
  },
  IDENTITY: {
    moved: false,
    changedIdentity: true,
    visible: false,
    connected: true,
    unmount: false,
    detachedRef: false,
    departed: false,
    expected: 0,
  },
  PENDING: {
    moved: false,
    changedIdentity: false,
    visible: true,
    connected: true,
    unmount: false,
    detachedRef: false,
    departed: false,
    expected: 0,
  },
  DISCONNECTED: {
    moved: false,
    changedIdentity: false,
    visible: false,
    connected: false,
    unmount: false,
    detachedRef: false,
    departed: false,
    expected: 0,
  },
  UNMOUNT: {
    moved: false,
    changedIdentity: false,
    visible: false,
    connected: true,
    unmount: true,
    detachedRef: false,
    departed: false,
    expected: 0,
  },
  NATIVE_REMOVAL: {
    moved: false,
    changedIdentity: false,
    visible: false,
    connected: true,
    unmount: false,
    detachedRef: true,
    departed: false,
    expected: 1,
  },
  USER_BLUR: {
    moved: false,
    changedIdentity: false,
    visible: false,
    connected: true,
    unmount: false,
    detachedRef: false,
    departed: true,
    expected: 0,
  },
} as const;
for (const [name, scenario] of Object.entries(FOCUS_REMOVAL_SCENARIOS)) {
  test(`focus fallback preserves ownership and context on removal: ${name}`, async (): Promise<void> => {
    const source = createRef<HTMLElement>();
    const target = createRef<HTMLElement>();
    const document: IFocusMockDocument = Object.assign(new EventTarget(), {
      body: {},
      activeElement: null,
    });
    const focused = { count: 0 };
    const sourceNode: IFocusMockNode = Object.assign(new EventTarget(), {
      isConnected: true,
      ownerDocument: document,
      focus: (): void => {
        document.activeElement = sourceNode;
        document.dispatchEvent(new Event(FOCUS_EVENTS.ENTER));
      },
    });
    const targetNode: IFocusMockNode = Object.assign(new EventTarget(), {
      isConnected: scenario.connected,
      ownerDocument: document,
      focus: (): void => {
        focused.count += 1;
        document.activeElement = targetNode;
        document.dispatchEvent(new Event(FOCUS_EVENTS.ENTER));
      },
    });
    const Fixture = ({ visible, identity }: IFocusFixtureProps): ReactElement => {
      useFocusFallback({ source, target, visible, identity, enabled: true });
      return (
        <>
          <Box ref={target} data-focus-mock="target" />
          {visible && <Box ref={source} data-focus-mock="source" />}
        </>
      );
    };
    const holder: IPublicationTestRenderer = { renderer: null };
    await act(async (): Promise<void> => {
      holder.renderer = create(<Fixture visible identity={1} />, {
        createNodeMock: (element: ReactElement<IFocusMockProps>): IFocusMockNode | null => {
          if (element.props["data-focus-mock"] === "source") {
            return sourceNode;
          }

          return element.props["data-focus-mock"] === "target" ? targetNode : null;
        },
      });
    });
    const renderer = holder.renderer;
    assert.ok(renderer);
    try {
      sourceNode.focus();
      if (scenario.moved) {
        document.activeElement = {};
        document.dispatchEvent(new Event(FOCUS_EVENTS.ENTER));
      }

      if (scenario.detachedRef) {
        source.current = null;
        sourceNode.dispatchEvent(new Event(FOCUS_EVENTS.LEAVE));
        document.activeElement = document.body;
        document.dispatchEvent(new Event(FOCUS_EVENTS.ENTER));
      }

      if (scenario.departed) {
        document.activeElement = document.body;
        sourceNode.dispatchEvent(new Event(FOCUS_EVENTS.LEAVE));
      }

      if (!scenario.visible && !scenario.moved) {
        sourceNode.isConnected = false;
        document.activeElement = document.body;
      }

      const nextIdentity = scenario.changedIdentity ? 2 : 1;
      await act(async (): Promise<void> => {
        if (scenario.unmount) {
          renderer.unmount();
          return;
        }

        renderer.update(<Fixture identity={nextIdentity} visible={scenario.visible} />);
      });
      assert.equal(focused.count, scenario.expected);
    } finally {
      await act(async (): Promise<void> => renderer.unmount());
      assert.equal(getEventListeners(document, FOCUS_EVENTS.ENTER).length, 0);
      assert.equal(getEventListeners(sourceNode, FOCUS_EVENTS.LEAVE).length, 0);
    }
  });
}

test("shared listener registration forwards options and shared abort disposes both captured targets", (): void => {
  const first = new EventTarget();
  const second = new EventTarget();
  const controller = new AbortController();
  const options: AddEventListenerOptions = {
    signal: controller.signal,
    capture: true,
    once: false,
    passive: true,
  };
  const calls = { count: 0 };
  const listener = (): void => {
    calls.count += 1;
  };
  const registration = mock.method(first, "addEventListener");
  try {
    registerEventListener({ target: first, type: FOCUS_EVENTS.ENTER, listener, options });
    registerEventListener({ target: second, type: FOCUS_EVENTS.LEAVE, listener, options });
    assert.equal(registration.mock.calls[0]?.arguments[2], options);
    first.dispatchEvent(new Event(FOCUS_EVENTS.ENTER));
    second.dispatchEvent(new Event(FOCUS_EVENTS.LEAVE));
    assert.equal(calls.count, 2);
    controller.abort();
    assert.equal(getEventListeners(first, FOCUS_EVENTS.ENTER).length, 0);
    assert.equal(getEventListeners(second, FOCUS_EVENTS.LEAVE).length, 0);
    first.dispatchEvent(new Event(FOCUS_EVENTS.ENTER));
    second.dispatchEvent(new Event(FOCUS_EVENTS.LEAVE));
    assert.equal(calls.count, 2);
  } finally {
    controller.abort();
    registration.mock.restore();
  }
});
test("shared listener hook keeps latest callback and cleans captured target on replacement disable and unmount", async (): Promise<void> => {
  const first = new EventTarget();
  const second = new EventTarget();
  const calls = { first: 0, second: 0 };
  const initial = (): void => {
    calls.first += 1;
  };
  const updated = (): void => {
    calls.second += 1;
  };
  const Fixture = ({ target, listener, enabled }: IEventListenerFixture): null => {
    useEventListener({ target, listener, type: FOCUS_EVENTS.ENTER, isEnabled: enabled });
    return null;
  };
  const holder: IPublicationTestRenderer = { renderer: null };
  await act(async (): Promise<void> => {
    holder.renderer = create(<Fixture enabled target={first} listener={initial} />);
  });
  const renderer = holder.renderer;
  assert.ok(renderer);
  try {
    first.dispatchEvent(new Event(FOCUS_EVENTS.ENTER));
    assert.equal(calls.first, 1);
    await act(async (): Promise<void> => {
      renderer.update(<Fixture enabled target={first} listener={updated} />);
    });
    first.dispatchEvent(new Event(FOCUS_EVENTS.ENTER));
    assert.equal(calls.second, 1);
    assert.equal(getEventListeners(first, FOCUS_EVENTS.ENTER).length, 1);
    await act(async (): Promise<void> => {
      renderer.update(<Fixture enabled target={second} listener={updated} />);
    });
    assert.equal(getEventListeners(first, FOCUS_EVENTS.ENTER).length, 0);
    second.dispatchEvent(new Event(FOCUS_EVENTS.ENTER));
    assert.equal(calls.second, 2);
    await act(async (): Promise<void> => {
      renderer.update(<Fixture enabled={false} target={second} listener={updated} />);
    });
    assert.equal(getEventListeners(second, FOCUS_EVENTS.ENTER).length, 0);
    second.dispatchEvent(new Event(FOCUS_EVENTS.ENTER));
    assert.equal(calls.second, 2);
    await act(async (): Promise<void> => {
      renderer.update(<Fixture enabled target={second} listener={updated} />);
    });
    assert.equal(getEventListeners(second, FOCUS_EVENTS.ENTER).length, 1);
  } finally {
    await act(async (): Promise<void> => renderer.unmount());
    assert.equal(getEventListeners(second, FOCUS_EVENTS.ENTER).length, 0);
  }
});

test("publication accepts canonical Backend Drive open URLs in summary history and file navigation", (): void => {
  const fileUrl = "https://drive.google.com/open?id=qa-reserved-file_123-ABC";
  const stage: IQuotationPublicationStage = {
    cycleId: "cycle",
    generation: 1,
    documentKind: PUBLICATION_KIND.QUOTATION,
    sourceVersion: 4,
    state: PUBLICATION_STATE.PUBLISHED,
    reason: null,
    updatedAt: "2026-11-24T00:30:00Z",
    destinationLabel: "הצעות מחיר",
    fileUrl,
    lifecycleEventId: "event",
  };
  const publication = summary({
    state: PUBLICATION_STATE.PUBLISHED,
    canRetry: false,
    reason: null,
    fileUrl,
    history: [stage],
  });
  assert.equal(isPublicationUrl(fileUrl), true);
  assert.equal(
    isPublicationUrl(
      "https://drive.google.com/file/d/qa-reserved-file_123-ABC/view?usp=drive_link",
    ),
    true,
  );
  assert.equal(isQuotationPublication(publication), true);
  const markup = renderToStaticMarkup(
    <QuotationPublicationNotice
      busy={false}
      error={null}
      refreshing={false}
      publication={publication}
      retry={async (): Promise<void> => {}}
      refresh={async (): Promise<void> => {}}
    />,
  );
  assert.ok(markup.includes(`href="${fileUrl}"`));
  assert.ok(markup.includes(PUBLICATION_COPY.OPEN));
  const quotation = quotationFixture();
  quotation.lifecycleHistory = [
    {
      id: "event",
      actorId: "actor",
      actorName: "Dana",
      occurredAt: "2026-11-24T00:30:00Z",
      quotationId: quotation.id,
      quotationVersion: 4,
      fromStatus: QUOTATION_STATUS.DRAFT,
      toStatus: QUOTATION_STATUS.REVIEW,
      action: QUOTATION_LIFECYCLE_ACTION.SUBMIT,
      reason: null,
    },
  ];
  assert.equal(quotationLifecycleTimeline(quotation, publication)[0]?.fileLink?.href, fileUrl);
  assert.equal(
    isQuotationPublication({
      ...publication,
      history: [{ ...stage, fileUrl: "https://drive.google.com/open?id=bad/id" }],
    }),
    false,
  );
});
test("publication Drive links reject credentials ports path tricks unsafe IDs and extra open parameters", (): void => {
  const invalidUrls = [
    "http://drive.google.com/open?id=ID",
    "javascript:alert(1)",
    "https://drive.google.com.evil.test/open?id=ID",
    "https://drive.google.com@evil.test/open?id=ID",
    "https://user@drive.google.com/open?id=ID",
    "https://drive.google.com:443/open?id=ID",
    "https://drive.google.com:8443/open?id=ID",
    "https://drive.google.com//open?id=ID",
    "https://drive.google.com/%6fpen?id=ID",
    "https://drive.google.com/open/?id=ID",
    "https://drive.google.com/open?id=",
    "https://drive.google.com/open?id=ID&id=OTHER",
    "https://drive.google.com/open?id=ID&usp=sharing",
    "https://drive.google.com/open?id=ID#view",
    "https://drive.google.com/open?id=bad/id",
    "https://drive.google.com/open?id=bad%2FID",
    "https://drive.google.com/open?id=bad%20ID",
    "https://drive.google.com/open?id=..",
    "https://drive.google.com/open?id=ID\n",
    "https://drive.google.com/file/d/ID/view\n",
    "https://drive.google.com/file/d/ID/view?usp=bad\nvalue",
    "https://drive.google.com/file/d/bad%2FID/view",
  ];
  invalidUrls.forEach((url): void => {
    assert.equal(isPublicationUrl(url), false, `Unsafe publication link: ${JSON.stringify(url)}`);
  });
});
