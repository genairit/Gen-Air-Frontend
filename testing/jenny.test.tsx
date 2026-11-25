import {
  AxiosError,
  CanceledError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  toJennyChatRequest,
  createJennyMessage,
  createProjectJennyContext,
} from "../src/utilities/jenny.utility";

import {
  JENNY_COPY,
  JENNY_ROLES,
  JENNY_HISTORY_LIMIT,
  JENNY_CHAT_TIMEOUT_MS,
  JENNY_SERVER_DEADLINE_MS,
  JENNY_MESSAGE_MAX_LENGTH,
} from "../src/constants/jenny.constant";

import { test } from "node:test";
import assert from "node:assert/strict";
import type { ReactElement } from "react";
import Jenny from "../src/components/Jenny/Jenny";
import Button from "../src/components/Button/Button";
import { setSession } from "../src/store/session.store";
import TextField from "../src/components/TextField/TextField";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { httpClient } from "../src/services/http-client.service";
import InlineError from "../src/components/InlineError/InlineError";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MARKDOWN_BLOCK_KINDS } from "../src/constants/markdown.constant";
import { API_ENDPOINTS, HTTP_STATUS } from "../src/constants/api.constant";
import { parseRestrictedMarkdown } from "../src/utilities/markdown.utility";
import type { IJennyThreadMessage } from "../src/interfaces/jenny.interface";
import { PERMISSIONS, type PermissionType } from "../src/constants/permission.constant";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
// MUI's autosizing textarea schedules frames once its node mock is mounted; Node has no frame API.
Reflect.set(globalThis, "requestAnimationFrame", (callback: () => void) => setTimeout(callback, 0));
Reflect.set(globalThis, "cancelAnimationFrame", (handle: number) => clearTimeout(handle));

interface IChatCall {
  body: unknown;
  url: string | null;
  timeout: number | null;
  signal: AbortSignal | null;
}

interface IFocusLabelProps {
  "aria-label"?: string;
}

interface IDeferredResponse {
  reject: (error: unknown) => void;
  config: InternalAxiosRequestConfig;
  resolve: (response: AxiosResponse) => void;
}

interface IKeyEventOptions {
  key: string;
  shiftKey?: boolean;
  isComposing?: boolean;
}

const PROJECT_ID = "project-jenny";
const PROJECT_NAME = "מגדלי הים";
const ANSWER = {
  message: "הפרויקט בשלב **ביצוע**.\n\n- קומה 1\n- קומה 2",
  sources: [
    { fileId: "file-1", fileName: "Spec.pdf", page: 3, url: "https://drive.google.com/file-1" },
    {
      fileId: "file-2",
      fileName: "תוכנית.pdf",
      page: null,
      url: "https://drive.google.com/file-2",
    },
  ],
};

const flushScheduledUpdates = async (): Promise<void> => {
  await act(async () => new Promise<void>(resolve => setTimeout(resolve, 0)));
};

const startWithoutAwaiting = async (start: () => Promise<void>): Promise<void> => {
  await act(async () => {
    start().catch(error => assert.fail(String(error)));
  });
  await flushScheduledUpdates();
};

const createHarness = () => {
  const calls: IChatCall[] = [];
  const pending: IDeferredResponse[] = [];
  const adapter = httpClient.defaults.adapter;
  httpClient.defaults.adapter = (config: InternalAxiosRequestConfig) => {
    const signal = config.signal instanceof AbortSignal ? config.signal : null;
    calls.push({
      signal,
      url: config.url ?? null,
      timeout: config.timeout ?? null,
      body: JSON.parse(String(config.data)),
    });
    return new Promise<AxiosResponse>((resolve, reject) => {
      signal?.addEventListener("abort", () => reject(new CanceledError()));
      pending.push({ config, resolve, reject });
    });
  };
  const respond = async (data: unknown, status = 200): Promise<void> => {
    const request = pending.shift();
    assert.ok(request);
    await act(async () => {
      request.resolve({ data, status, statusText: "OK", headers: {}, config: request.config });
    });
    await flushScheduledUpdates();
  };
  const fail = async (status: number): Promise<void> => {
    const request = pending.shift();
    assert.ok(request);
    const config = request.config;
    const response: AxiosResponse = { data: {}, status, statusText: "", headers: {}, config };
    await act(async () => {
      request.reject(new AxiosError("failed", AxiosError.ERR_BAD_RESPONSE, config, null, response));
    });
    await flushScheduledUpdates();
  };
  const failWithoutResponse = async (code: string): Promise<void> => {
    const request = pending.shift();
    assert.ok(request);
    await act(async () => {
      request.reject(new AxiosError("failed", code, request.config, null));
    });
    await flushScheduledUpdates();
  };
  const restore = () => {
    httpClient.defaults.adapter = adapter;
  };
  return { calls, respond, fail, failWithoutResponse, restore };
};

const FOCUS_TARGET_LABELS: string[] = [JENNY_COPY.INPUT_LABEL, JENNY_COPY.LAUNCHER_LABEL];
const FAKE_WINDOW = { addEventListener: () => {}, removeEventListener: () => {} };

const createNodeMock =
  (focusLog: string[], ownerDocument: EventTarget) => (element: ReactElement<IFocusLabelProps>) => {
    const label = element.props["aria-label"] ?? null;

    if (element.type === "span") {
      return { ownerDocument };
    }

    if (label === null || !FOCUS_TARGET_LABELS.includes(label)) {
      return null;
    }

    return {
      style: {},
      tagName: "BUTTON",
      isConnected: true,
      ownerDocument: { defaultView: FAKE_WINDOW },
      focus: () => focusLog.push(label),
    };
  };

const render = async (projectId = PROJECT_ID) => {
  const focusLog: string[] = [];
  const ownerDocument = new EventTarget();
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const element = (id: string) => (
    <QueryClientProvider client={client}>
      <Jenny contextLabel={PROJECT_NAME} context={createProjectJennyContext(id)} />
    </QueryClientProvider>
  );
  const view: { renderer: ReactTestRenderer | null } = { renderer: null };
  await act(async () => {
    view.renderer = create(element(projectId), {
      createNodeMock: createNodeMock(focusLog, ownerDocument),
    });
  });
  const renderer = view.renderer;
  assert.ok(renderer);
  return {
    renderer,
    focusLog,
    ownerDocument,
    rerender: async (id: string) => act(async () => renderer.update(element(id))),
    unmount: async () => act(async () => renderer.unmount()),
  };
};

const collectText = (node: ReactTestInstance | string): string => {
  if (typeof node === "string") {
    return node;
  }

  return node.children.map(collectText).join("");
};

const textOf = (renderer: ReactTestRenderer) => collectText(renderer.root);

const findLauncher = (renderer: ReactTestRenderer) =>
  renderer.root.find(
    node => node.type === "button" && node.props["aria-label"] === JENNY_COPY.LAUNCHER_LABEL,
  );

const findButton = (renderer: ReactTestRenderer, text: string) =>
  renderer.root.findAllByType(Button).find(button => button.props.text === text) ?? null;

const openChat = async (renderer: ReactTestRenderer) => {
  await act(async () => findLauncher(renderer).props.onClick({ preventDefault: () => {} }));
};

const typeDraft = async (renderer: ReactTestRenderer, value: string) => {
  await act(async () => renderer.root.findByType(TextField).props.onChange(value, null));
};

const pressKey = async (
  renderer: ReactTestRenderer,
  { key, shiftKey = false, isComposing = false }: IKeyEventOptions,
) => {
  const state = { prevented: false };
  const event = {
    key,
    shiftKey,
    nativeEvent: { isComposing },
    preventDefault: () => (state.prevented = true),
  };
  await startWithoutAwaiting(() => renderer.root.findByType(TextField).props.onKeyDown(event));
  return state.prevented;
};

const askQuestion = async (renderer: ReactTestRenderer, question: string) => {
  await typeDraft(renderer, question);
  await pressKey(renderer, { key: "Enter" });
};

const findSourceLinks = (renderer: ReactTestRenderer) =>
  renderer.root.findAll(node => node.type === "a");

const findDialog = (renderer: ReactTestRenderer) =>
  renderer.root.findAll(node => node.type === "div" && node.props.role === "dialog");

const findLiveRegion = (renderer: ReactTestRenderer) =>
  renderer.root.find(node => node.type === "div" && node.props["aria-live"] === "polite");

const signIn = async (permissions: PermissionType[]) => {
  await act(async () =>
    setSession({
      accessToken: "token",
      user: {
        id: "user",
        email: "user@example.com",
        phone: "",
        firstName: "Test",
        lastName: "User",
        employeeNumber: "",
        deletedAt: null,
        role: USER_ROLES.SYSTEM_ADMIN,
        assignedRoles: [USER_ROLES.SYSTEM_ADMIN],
        permissions,
      },
    }),
  );
};

const signOut = async () => {
  await act(async () => setSession(null));
};

test("restricted markdown keeps paragraphs, bold and lists and never produces markup", () => {
  const blocks = parseRestrictedMarkdown(
    "שלום **עולם**\nשורה\n\n- א\n- ב\n1. ראשון\n<script>x</script>",
  );
  assert.deepEqual(
    blocks.map(block => block.kind),
    [
      MARKDOWN_BLOCK_KINDS.PARAGRAPH,
      MARKDOWN_BLOCK_KINDS.UNORDERED_LIST,
      MARKDOWN_BLOCK_KINDS.ORDERED_LIST,
      MARKDOWN_BLOCK_KINDS.PARAGRAPH,
    ],
  );
  assert.deepEqual(blocks[0].lines[0], [
    { text: "שלום ", isBold: false },
    { text: "עולם", isBold: true },
  ]);
  assert.equal(blocks[0].lines.length, 2);
  assert.deepEqual(blocks[3].lines[0], [{ text: "<script>x</script>", isBold: false }]);
});

test("chat request keeps the latest history, starting with a user turn, without local fields", () => {
  const messages: IJennyThreadMessage[] = Array.from(
    { length: JENNY_HISTORY_LIMIT + 5 },
    (_, index) =>
      createJennyMessage({
        role: index % 2 === 0 ? JENNY_ROLES.USER : JENNY_ROLES.ASSISTANT,
        content: `m${index}`,
      }),
  );
  const request = toJennyChatRequest({ context: createProjectJennyContext(PROJECT_ID), messages });
  assert.equal(request.messages.length, JENNY_HISTORY_LIMIT - 1);
  assert.deepEqual(request.messages[0], { role: JENNY_ROLES.USER, content: "m6" });
  assert.deepEqual(request.messages.at(-1), { role: JENNY_ROLES.USER, content: "m24" });
  assert.deepEqual(request.context, { type: "project", id: PROJECT_ID });
});

test("chat request trims, caps and drops empty messages so the last stays the question", () => {
  const longAnswer = "א".repeat(JENNY_MESSAGE_MAX_LENGTH + 50);
  const messages = [
    createJennyMessage({ role: JENNY_ROLES.USER, content: "  ראשונה  " }),
    createJennyMessage({ role: JENNY_ROLES.ASSISTANT, content: `  ${longAnswer}` }),
    createJennyMessage({ role: JENNY_ROLES.ASSISTANT, content: "   " }),
    createJennyMessage({ role: JENNY_ROLES.USER, content: "שנייה" }),
  ];
  const request = toJennyChatRequest({ context: createProjectJennyContext(PROJECT_ID), messages });
  assert.deepEqual(
    request.messages.map(message => [message.role, message.content.length]),
    [
      [JENNY_ROLES.USER, "ראשונה".length],
      [JENNY_ROLES.ASSISTANT, JENNY_MESSAGE_MAX_LENGTH],
      [JENNY_ROLES.USER, "שנייה".length],
    ],
  );
  assert.deepEqual(Object.keys(request).sort(), ["context", "messages"]);
});

test("chat request drops unanswered questions but always keeps the latest one", () => {
  const messages = [
    createJennyMessage({ role: JENNY_ROLES.USER, content: "נכשלה" }),
    createJennyMessage({ role: JENNY_ROLES.USER, content: "נענתה" }),
    createJennyMessage({ role: JENNY_ROLES.ASSISTANT, content: "תשובה" }),
    createJennyMessage({ role: JENNY_ROLES.USER, content: "גם נכשלה" }),
    createJennyMessage({ role: JENNY_ROLES.USER, content: "אחרונה" }),
  ];
  const request = toJennyChatRequest({ context: createProjectJennyContext(PROJECT_ID), messages });
  assert.deepEqual(
    request.messages.map(message => message.content),
    ["נענתה", "תשובה", "אחרונה"],
  );
});

test("launcher toggles a non-modal panel with an empty greeting", async () => {
  const view = await render();
  try {
    const launcher = findLauncher(view.renderer);
    assert.equal(launcher.props["aria-expanded"], false);
    assert.equal("aria-controls" in launcher.props, false);
    assert.equal(findDialog(view.renderer).length, 0);
    await openChat(view.renderer);
    const [dialog] = findDialog(view.renderer);
    assert.equal(findLauncher(view.renderer).props["aria-expanded"], true);
    assert.equal(findLauncher(view.renderer).props["aria-controls"], dialog.props.id);
    assert.equal(dialog.props["aria-modal"], "false");
    assert.match(textOf(view.renderer), new RegExp(JENNY_COPY.GREETING));
    assert.match(textOf(view.renderer), new RegExp(PROJECT_NAME));
    await openChat(view.renderer);
    assert.equal(findDialog(view.renderer).length, 0);
    assert.equal("aria-controls" in findLauncher(view.renderer).props, false);
  } finally {
    await view.unmount();
  }
});

test("Enter sends the question, shows thinking, then renders the answer with sources", async () => {
  const http = createHarness();
  const view = await render();
  try {
    await openChat(view.renderer);
    await askQuestion(view.renderer, "  מה הסטטוס?  ");
    assert.equal(http.calls.length, 1);
    assert.equal(http.calls[0].url, API_ENDPOINTS.JENNY_CHAT);
    assert.equal(http.calls[0].timeout, JENNY_CHAT_TIMEOUT_MS);
    assert.ok(JENNY_CHAT_TIMEOUT_MS > JENNY_SERVER_DEADLINE_MS);
    assert.deepEqual(http.calls[0].body, {
      context: { type: "project", id: PROJECT_ID },
      messages: [{ role: "user", content: "מה הסטטוס?" }],
    });
    assert.equal(view.renderer.root.findByType(TextField).props.value, "");
    assert.match(textOf(view.renderer), /מה הסטטוס\?/);
    assert.match(textOf(view.renderer), new RegExp(JENNY_COPY.THINKING));
    assert.equal(findButton(view.renderer, JENNY_COPY.SEND)?.props.disabled, true);

    await http.respond(ANSWER);
    const text = textOf(view.renderer);
    assert.doesNotMatch(text, new RegExp(JENNY_COPY.THINKING));
    assert.equal(view.renderer.root.findAll(node => node.type === "strong").length, 1);
    assert.equal(
      view.renderer.root.findAll(node => node.type === "li" && node.props.dir === "auto").length,
      2,
    );
    assert.match(text, new RegExp(JENNY_COPY.SOURCES));
    assert.match(text, /עמ׳ 3/);
    assert.match(text, new RegExp(`${JENNY_COPY.ANSWER_ANNOUNCEMENT_PREFIX}הפרויקט בשלב ביצוע`));
  } finally {
    http.restore();
    await view.unmount();
  }
});

test("follow-up questions send the full in-memory history", async () => {
  const http = createHarness();
  const view = await render();
  try {
    await openChat(view.renderer);
    await askQuestion(view.renderer, "שאלה 1");
    await http.respond(ANSWER);
    await askQuestion(view.renderer, "שאלה 2");
    assert.deepEqual(http.calls[1].body, {
      context: { type: "project", id: PROJECT_ID },
      messages: [
        { role: "user", content: "שאלה 1" },
        { role: "assistant", content: ANSWER.message },
        { role: "user", content: "שאלה 2" },
      ],
    });
    await http.respond(ANSWER);
  } finally {
    http.restore();
    await view.unmount();
  }
});

test("Shift+Enter, IME composition and blank drafts never send", async () => {
  const http = createHarness();
  const view = await render();
  try {
    await openChat(view.renderer);
    await typeDraft(view.renderer, "שורה");
    assert.equal(await pressKey(view.renderer, { key: "Enter", shiftKey: true }), false);
    assert.equal(await pressKey(view.renderer, { key: "Enter", isComposing: true }), false);
    await typeDraft(view.renderer, "   ");
    assert.equal(findButton(view.renderer, JENNY_COPY.SEND)?.props.disabled, true);
    assert.equal(await pressKey(view.renderer, { key: "Enter" }), true);
    assert.equal(http.calls.length, 0);
  } finally {
    http.restore();
    await view.unmount();
  }
});

test("server errors keep the question and retry re-sends the same history", async () => {
  const http = createHarness();
  const view = await render();
  try {
    await openChat(view.renderer);
    await askQuestion(view.renderer, "מה חסר?");
    await http.fail(500);
    assert.equal(
      view.renderer.root.findByType(InlineError).props.message,
      "לא הצלחתי לקבל תשובה. נסו שוב.",
    );
    assert.match(textOf(view.renderer), /מה חסר\?/);
    const retry = findButton(view.renderer, JENNY_COPY.RETRY);
    assert.ok(retry);
    await startWithoutAwaiting(() => retry.props.onClick());
    assert.deepEqual(http.calls[1].body, http.calls[0].body);
    assert.equal(view.renderer.root.findAllByType(InlineError).length, 0);
    await http.respond(ANSWER);
    assert.match(textOf(view.renderer), /הפרויקט בשלב/);
  } finally {
    http.restore();
    await view.unmount();
  }
});

const STATUS_FEEDBACK = [
  { status: HTTP_STATUS.BAD_REQUEST, message: /לנסח אותה מחדש/, canRetry: false },
  { status: HTTP_STATUS.UNAUTHORIZED, message: /אין לך הרשאה/, canRetry: false },
  { status: HTTP_STATUS.FORBIDDEN, message: /אין לך הרשאה/, canRetry: false },
  { status: HTTP_STATUS.NOT_FOUND, message: /הפרויקט לא נמצא/, canRetry: false },
  { status: HTTP_STATUS.TOO_MANY_REQUESTS, message: /יותר מדי/, canRetry: true },
  { status: HTTP_STATUS.BAD_GATEWAY, message: /לא הצלחתי לקבל תשובה/, canRetry: true },
  { status: HTTP_STATUS.SERVICE_UNAVAILABLE, message: /ג׳ני אינה זמינה כרגע/, canRetry: false },
  { status: HTTP_STATUS.GATEWAY_TIMEOUT, message: /לא הספיקה לענות בזמן/, canRetry: true },
] as const;

test("each documented failure status shows its Hebrew message and retry policy", async () => {
  const http = createHarness();
  const view = await render();
  try {
    await openChat(view.renderer);
    for (const { status, message, canRetry } of STATUS_FEEDBACK) {
      await askQuestion(view.renderer, `שאלה ${status}`);
      await http.fail(status);
      assert.match(view.renderer.root.findByType(InlineError).props.message, message);
      assert.equal(findButton(view.renderer, JENNY_COPY.RETRY) !== null, canRetry, String(status));
    }
  } finally {
    http.restore();
    await view.unmount();
  }
});

const UNSAFE_SOURCES = [
  { fileId: "x1", fileName: "script-link", page: null, url: "javascript:alert(1)" },
  { fileId: "x2", fileName: "insecure-drive", page: null, url: "http://drive.google.com/x" },
  { fileId: "x3", fileName: "phishing-host", page: 1, url: "https://drive.google.com.evil.io/x" },
  { fileId: "x4", fileName: "other-host", page: null, url: "https://example.com/doc" },
  { fileId: "x5", fileName: "unparseable-url", page: null, url: "not a url" },
];

test("source links require Drive permission and open safely in a new tab", async () => {
  const http = createHarness();
  await signOut();
  const view = await render();
  try {
    await openChat(view.renderer);
    await askQuestion(view.renderer, "מקורות?");
    await http.respond({
      ...ANSWER,
      sources: [
        ...ANSWER.sources,
        { fileId: "x", fileName: "x", page: null, url: "javascript:alert(1)" },
      ],
    });
    assert.equal(findSourceLinks(view.renderer).length, 0);
    assert.match(textOf(view.renderer), /Spec\.pdf/);
  } finally {
    await view.unmount();
  }
  await signIn([PERMISSIONS.DRIVE_READ]);
  const permitted = await render();
  try {
    await openChat(permitted.renderer);
    await askQuestion(permitted.renderer, "מקורות?");
    await http.respond({ ...ANSWER, sources: [...ANSWER.sources, ...UNSAFE_SOURCES] });
    const links = findSourceLinks(permitted.renderer);
    assert.deepEqual(
      links.map(link => link.props.href),
      ANSWER.sources.map(source => source.url),
    );
    assert.ok(
      links.every(
        link => link.props.target === "_blank" && link.props.rel === "noopener noreferrer",
      ),
    );
    assert.match(links[0].props["aria-label"], /עמוד 3/);
    for (const source of UNSAFE_SOURCES) {
      assert.match(textOf(permitted.renderer), new RegExp(source.fileName));
    }
  } finally {
    http.restore();
    await signOut();
    await permitted.unmount();
  }
});

test("new chat clears the thread, and switching context resets the conversation", async () => {
  const http = createHarness();
  const view = await render();
  try {
    await openChat(view.renderer);
    await askQuestion(view.renderer, "שאלה ראשונה");
    await http.respond(ANSWER);
    const newChat = view.renderer.root.find(
      node => node.type === "button" && node.props["aria-label"] === JENNY_COPY.NEW_CHAT,
    );
    await act(async () => newChat.props.onClick());
    assert.match(textOf(view.renderer), new RegExp(JENNY_COPY.GREETING));
    assert.doesNotMatch(textOf(view.renderer), /שאלה ראשונה/);

    await askQuestion(view.renderer, "שאלה על פרויקט א");
    await http.respond(ANSWER);
    await view.rerender("project-other");
    assert.doesNotMatch(textOf(view.renderer), /שאלה על פרויקט א/);
    assert.equal(findLauncher(view.renderer).props["aria-expanded"], false);
    await openChat(view.renderer);
    assert.match(textOf(view.renderer), new RegExp(JENNY_COPY.GREETING));
  } finally {
    http.restore();
    await view.unmount();
  }
});

test("a failed question is left out of the next request, and retry re-sends only the latest", async () => {
  const http = createHarness();
  const view = await render();
  try {
    await openChat(view.renderer);
    await askQuestion(view.renderer, "שאלה שנכשלה");
    await http.fail(HTTP_STATUS.SERVICE_UNAVAILABLE);
    await askQuestion(view.renderer, "שאלה חדשה");
    const latestOnly = {
      context: { type: "project", id: PROJECT_ID },
      messages: [{ role: "user", content: "שאלה חדשה" }],
    };
    assert.deepEqual(http.calls[1].body, latestOnly);
    await http.fail(500);
    const retry = findButton(view.renderer, JENNY_COPY.RETRY);
    assert.ok(retry);
    await startWithoutAwaiting(() => retry.props.onClick());
    assert.deepEqual(http.calls[2].body, latestOnly);
    await http.respond(ANSWER);
    await askQuestion(view.renderer, "המשך");
    assert.deepEqual(http.calls[3].body, {
      context: { type: "project", id: PROJECT_ID },
      messages: [
        { role: "user", content: "שאלה חדשה" },
        { role: "assistant", content: ANSWER.message },
        { role: "user", content: "המשך" },
      ],
    });
    await http.respond(ANSWER);
  } finally {
    http.restore();
    await view.unmount();
  }
});

const TRANSPORT_FAILURES = [AxiosError.ECONNABORTED, AxiosError.ETIMEDOUT, AxiosError.ERR_NETWORK];

test("timeouts and network failures show the generic error with retry", async () => {
  const http = createHarness();
  const view = await render();
  try {
    await openChat(view.renderer);
    for (const code of TRANSPORT_FAILURES) {
      await askQuestion(view.renderer, `שאלה ${code}`);
      await http.failWithoutResponse(code);
      assert.match(
        view.renderer.root.findByType(InlineError).props.message,
        /לא הצלחתי לקבל תשובה/,
      );
      assert.ok(findButton(view.renderer, JENNY_COPY.RETRY), code);
    }
  } finally {
    http.restore();
    await view.unmount();
  }
});

test("an identical consecutive answer is announced again", async () => {
  const http = createHarness();
  const view = await render();
  try {
    await openChat(view.renderer);
    await askQuestion(view.renderer, "שאלה");
    await http.respond(ANSWER);
    const announcement = collectText(findLiveRegion(view.renderer));
    assert.match(announcement, new RegExp(JENNY_COPY.ANSWER_ANNOUNCEMENT_PREFIX));
    await askQuestion(view.renderer, "שאלה");
    assert.equal(collectText(findLiveRegion(view.renderer)), "");
    await http.respond(ANSWER);
    assert.equal(collectText(findLiveRegion(view.renderer)), announcement);
  } finally {
    http.restore();
    await view.unmount();
  }
});

test("opening focuses the composer, Escape closes the panel and focus returns to the launcher", async () => {
  const view = await render();
  try {
    await openChat(view.renderer);
    assert.equal(view.focusLog.at(-1), JENNY_COPY.INPUT_LABEL);
    const [dialog] = findDialog(view.renderer);
    const stopped = { count: 0 };
    const keyEvent = (key: string) => ({ key, stopPropagation: () => (stopped.count += 1) });
    await act(async () => dialog.props.onKeyDown(keyEvent("ArrowDown")));
    assert.equal(findDialog(view.renderer).length, 1);
    assert.equal(stopped.count, 0);
    await act(async () => dialog.props.onKeyDown(keyEvent("Escape")));
    assert.equal(stopped.count, 1);
    assert.equal(findDialog(view.renderer).length, 0);
    assert.equal(findLauncher(view.renderer).props["aria-expanded"], false);
    assert.equal(view.focusLog.at(-1), JENNY_COPY.LAUNCHER_LABEL);
  } finally {
    await view.unmount();
  }
});

test("a pending request is aborted when the page unmounts or the project changes", async () => {
  const http = createHarness();
  const view = await render();
  const switched = await render();
  try {
    await openChat(view.renderer);
    await askQuestion(view.renderer, "שאלה ארוכה");
    const [unmountedCall] = http.calls;
    assert.equal(unmountedCall.signal?.aborted, false);
    await view.unmount();
    assert.equal(unmountedCall.signal?.aborted, true);

    await openChat(switched.renderer);
    await askQuestion(switched.renderer, "שאלה על פרויקט א");
    const switchedCall = http.calls[1];
    assert.equal(switchedCall.signal?.aborted, false);
    await switched.rerender("project-other");
    assert.equal(switchedCall.signal?.aborted, true);
    assert.doesNotMatch(textOf(switched.renderer), /שאלה על פרויקט א/);
    assert.equal(switched.renderer.root.findAllByType(InlineError).length, 0);
  } finally {
    http.restore();
    await switched.unmount();
  }
});

const dispatchDocumentEscape = async (ownerDocument: EventTarget) => {
  const event = new Event("keydown", { cancelable: true });
  Object.defineProperty(event, "key", { value: "Escape" });
  await act(async () => {
    ownerDocument.dispatchEvent(event);
  });
  return event;
};

const findTooltip = (renderer: ReactTestRenderer, title: string) =>
  renderer.root.find(node => node.props.title === title && typeof node.props.onOpen === "function");

test("Escape closes an open header tooltip first and only then the panel", async () => {
  const view = await render();
  try {
    await openChat(view.renderer);
    await act(async () => findTooltip(view.renderer, JENNY_COPY.CLOSE).props.onOpen());
    assert.equal(findTooltip(view.renderer, JENNY_COPY.CLOSE).props.open, true);

    const tooltipEscape = await dispatchDocumentEscape(view.ownerDocument);
    assert.equal(tooltipEscape.cancelBubble, true);
    assert.equal(findTooltip(view.renderer, JENNY_COPY.CLOSE).props.open, false);
    assert.equal(findDialog(view.renderer).length, 1);

    const panelEscape = await dispatchDocumentEscape(view.ownerDocument);
    assert.equal(panelEscape.cancelBubble, false);
    const [dialog] = findDialog(view.renderer);
    await act(async () => dialog.props.onKeyDown(panelEscape));
    assert.equal(findDialog(view.renderer).length, 0);
    assert.equal(view.focusLog.at(-1), JENNY_COPY.LAUNCHER_LABEL);
  } finally {
    await view.unmount();
  }
});

test("an unparseable source url renders as plain text without a link", async () => {
  const http = createHarness();
  await signIn([PERMISSIONS.DRIVE_READ]);
  const view = await render();
  try {
    await openChat(view.renderer);
    await askQuestion(view.renderer, "מקור שבור?");
    const unparseable = { fileId: "bad", fileName: "broken-source.pdf", page: 4, url: "not a url" };
    await http.respond({ message: "תשובה", sources: [unparseable] });
    assert.equal(findSourceLinks(view.renderer).length, 0);
    assert.match(textOf(view.renderer), /broken-source\.pdf/);
    assert.match(textOf(view.renderer), /עמ׳ 4/);
  } finally {
    http.restore();
    await signOut();
    await view.unmount();
  }
});

const MALFORMED_RESPONSES = [
  { message: 1, sources: [] },
  {
    message: "תשובה שלא אמורה להופיע",
    sources: [{ fileId: "f", fileName: "f.pdf", page: "3", url: "https://drive.google.com/f" }],
  },
];

test("a malformed success body shows the generic retryable error instead of an answer", async () => {
  const http = createHarness();
  const view = await render();
  try {
    await openChat(view.renderer);
    for (const body of MALFORMED_RESPONSES) {
      await askQuestion(view.renderer, "שאלה");
      await http.respond(body);
      assert.equal(
        view.renderer.root.findByType(InlineError).props.message,
        "לא הצלחתי לקבל תשובה. נסו שוב.",
      );
      assert.ok(findButton(view.renderer, JENNY_COPY.RETRY));
      assert.doesNotMatch(textOf(view.renderer), /תשובה שלא אמורה להופיע/);
      assert.equal(findSourceLinks(view.renderer).length, 0);
    }
  } finally {
    http.restore();
    await view.unmount();
  }
});
