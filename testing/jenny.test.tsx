import {
  toJennyChatRequest,
  createJennyMessage,
  createProjectJennyContext,
} from "../src/utilities/jenny.utility";

import {
  JENNY_COPY,
  JENNY_ROLES,
  JENNY_HISTORY_LIMIT,
  JENNY_MESSAGE_MAX_LENGTH,
} from "../src/constants/jenny.constant";

import { test } from "node:test";
import assert from "node:assert/strict";
import Jenny from "../src/components/Jenny/Jenny";
import Button from "../src/components/Button/Button";
import { setSession } from "../src/store/session.store";
import { TIME_UNITS } from "../src/constants/time.constant";
import TextField from "../src/components/TextField/TextField";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { httpClient } from "../src/services/http-client.service";
import { PERMISSIONS } from "../src/constants/permission.constant";
import InlineError from "../src/components/InlineError/InlineError";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MARKDOWN_BLOCK_KINDS } from "../src/constants/markdown.constant";
import { API_ENDPOINTS, HTTP_STATUS } from "../src/constants/api.constant";
import { parseRestrictedMarkdown } from "../src/utilities/markdown.utility";
import type { IJennyThreadMessage } from "../src/interfaces/jenny.interface";
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

interface IChatCall {
  body: unknown;
  url: string | undefined;
  timeout: number | undefined;
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
    calls.push({ url: config.url, timeout: config.timeout, body: JSON.parse(String(config.data)) });
    return new Promise<AxiosResponse>((resolve, reject) =>
      pending.push({ config, resolve, reject }),
    );
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
  const restore = () => {
    httpClient.defaults.adapter = adapter;
  };
  return { calls, respond, fail, restore };
};

const render = async (projectId = PROJECT_ID) => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const element = (id: string) => (
    <QueryClientProvider client={client}>
      <Jenny contextLabel={PROJECT_NAME} context={createProjectJennyContext(id)} />
    </QueryClientProvider>
  );
  const view: { renderer: ReactTestRenderer | null } = { renderer: null };
  await act(async () => {
    view.renderer = create(element(projectId));
  });
  const renderer = view.renderer;
  assert.ok(renderer);
  return {
    renderer,
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

test("chat request keeps only the latest history messages and drops local fields", () => {
  const messages: IJennyThreadMessage[] = Array.from(
    { length: JENNY_HISTORY_LIMIT + 5 },
    (_, index) =>
      createJennyMessage({
        role: index % 2 === 0 ? JENNY_ROLES.USER : JENNY_ROLES.ASSISTANT,
        content: `m${index}`,
      }),
  );
  const request = toJennyChatRequest({ context: createProjectJennyContext(PROJECT_ID), messages });
  assert.equal(request.messages.length, JENNY_HISTORY_LIMIT);
  assert.deepEqual(request.messages[0], { role: JENNY_ROLES.ASSISTANT, content: "m5" });
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

test("launcher toggles a non-modal panel with an empty greeting", async () => {
  const view = await render();
  try {
    const launcher = findLauncher(view.renderer);
    assert.equal(launcher.props["aria-expanded"], false);
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
    assert.ok((http.calls[0].timeout ?? 0) >= 120 * TIME_UNITS.SECOND_MS);
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
  { status: HTTP_STATUS.FORBIDDEN, message: /אין לך הרשאה/, canRetry: false },
  { status: HTTP_STATUS.NOT_FOUND, message: /הפרויקט לא נמצא/, canRetry: false },
  { status: HTTP_STATUS.TOO_MANY_REQUESTS, message: /יותר מדי/, canRetry: true },
  { status: HTTP_STATUS.BAD_GATEWAY, message: /לא הצלחתי לקבל תשובה/, canRetry: true },
  { status: HTTP_STATUS.SERVICE_UNAVAILABLE, message: /ג׳ני אינה זמינה כרגע/, canRetry: false },
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

test("source links require Drive permission and open safely in a new tab", async () => {
  const http = createHarness();
  setSession(null);
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
      permissions: [PERMISSIONS.DRIVE_READ],
    },
  });
  const permitted = await render();
  try {
    await openChat(permitted.renderer);
    await askQuestion(permitted.renderer, "מקורות?");
    await http.respond({
      ...ANSWER,
      sources: [
        ...ANSWER.sources,
        { fileId: "x", fileName: "x", page: null, url: "javascript:alert(1)" },
      ],
    });
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
  } finally {
    http.restore();
    setSession(null);
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
