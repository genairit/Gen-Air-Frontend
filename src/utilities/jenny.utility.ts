import {
  JENNY_COPY,
  JENNY_ROLES,
  type JennyRoleType,
  JENNY_GENERIC_ERROR,
  JENNY_HISTORY_LIMIT,
  JENNY_CONTEXT_TYPES,
  JENNY_ERROR_BY_STATUS,
  JENNY_SOURCE_LINK_POLICY,
  JENNY_MESSAGE_MAX_LENGTH,
  JENNY_SHEET_TRANSITION_MS,
} from "../constants/jenny.constant";

import type {
  IJennySource,
  IJennyContext,
  IJennyChatMessage,
  IJennyChatRequest,
  IJennyChatResponse,
  IJennyErrorFeedback,
  IJennyThreadMessage,
} from "../interfaces/jenny.interface";

import { isAxiosError } from "axios";
import { parseUrl } from "./url.utility";
import { isolateBidiText } from "./text.utility";
import { toMarkdownPlainText } from "./markdown.utility";

interface IJennyMessageInput {
  content: string;
  role: JennyRoleType;
  sources?: IJennySource[];
}

interface IJennySourceAccess {
  source: IJennySource;
  canOpenSources: boolean;
}

interface IJennyRequestInput {
  context: IJennyContext;
  messages: IJennyThreadMessage[];
}

interface IJennyThreadState {
  isWaiting: boolean;
  messages: IJennyThreadMessage[];
  error: IJennyErrorFeedback | null;
}

export const createProjectJennyContext = (projectId: string): IJennyContext => ({
  id: projectId,
  type: JENNY_CONTEXT_TYPES.PROJECT,
});

export const getJennyContextKey = (context: IJennyContext) => `${context.type}:${context.id}`;

export const createJennyMessage = ({
  role,
  content,
  sources = [],
}: IJennyMessageInput): IJennyThreadMessage => ({
  role,
  content,
  sources,
  id: crypto.randomUUID(),
});

export const createJennyAnswer = (response: IJennyChatResponse) =>
  createJennyMessage({
    role: JENNY_ROLES.ASSISTANT,
    content: response.message,
    sources: response.sources,
  });

const toChatMessage = ({ role, content }: IJennyChatMessage): IJennyChatMessage => ({
  role,
  content: content.trim().slice(0, JENNY_MESSAGE_MAX_LENGTH),
});

const hasContent = ({ content }: IJennyChatMessage) => content !== "";

const isAnsweredOrLatest = (
  message: IJennyChatMessage,
  index: number,
  messages: IJennyChatMessage[],
) => {
  const isAssistant = message.role === JENNY_ROLES.ASSISTANT;
  const isLatest = index === messages.length - 1;
  const isAnswered = messages[index + 1]?.role === JENNY_ROLES.ASSISTANT;

  return isAssistant || isLatest || isAnswered;
};

const startWithUserTurn = (messages: IJennyChatMessage[]) => {
  const firstUserIndex = messages.findIndex(message => message.role === JENNY_ROLES.USER);

  if (firstUserIndex === -1) {
    return [];
  }

  return messages.slice(firstUserIndex);
};

export const toJennyChatHistory = (messages: IJennyChatMessage[]): IJennyChatMessage[] => {
  const answeredHistory = messages
    .map(toChatMessage)
    .filter(hasContent)
    .filter(isAnsweredOrLatest)
    .slice(-JENNY_HISTORY_LIMIT);

  return startWithUserTurn(answeredHistory);
};

export const toJennyChatRequest = ({
  context,
  messages,
}: IJennyRequestInput): IJennyChatRequest => ({
  context: { type: context.type, id: context.id },
  messages: toJennyChatHistory(messages),
});

export const isSendableDraft = (draft: string) => draft.trim() !== "";

export const getJennyThreadVersion = ({ messages, isWaiting, error }: IJennyThreadState) =>
  [messages.length, isWaiting, error?.message ?? ""].join(":");

export const getJennyErrorFeedback = (error: unknown): IJennyErrorFeedback => {
  if (!isAxiosError(error)) {
    return JENNY_GENERIC_ERROR;
  }

  return JENNY_ERROR_BY_STATUS[error.response?.status ?? 0] ?? JENNY_GENERIC_ERROR;
};

export const getJennySourceKey = ({ fileId, page }: IJennySource) => `${fileId}:${page ?? "all"}`;

export const getJennySourcePageLabel = ({ page }: IJennySource): string | null => {
  if (page == null) {
    return null;
  }

  return `${JENNY_COPY.SOURCE_PAGE_PREFIX}${page}`;
};

const formatSpokenSourceLocation = ({ fileName, page }: IJennySource) => {
  const isolatedName = isolateBidiText(fileName);

  if (page == null) {
    return isolatedName;
  }

  return `${isolatedName}, ${JENNY_COPY.SOURCE_SPOKEN_PAGE_PREFIX}${page}`;
};

export const formatJennySourceLabel = (source: IJennySource) =>
  `${formatSpokenSourceLocation(source)} – ${JENNY_COPY.SOURCE_OPENS_IN_DRIVE}`;

const isAllowedSourceUrl = (value: string) => {
  const url = parseUrl(value);
  const hosts: readonly string[] = JENNY_SOURCE_LINK_POLICY.HOSTS;

  if (url === null) {
    return false;
  }

  const isSecure = url.protocol === JENNY_SOURCE_LINK_POLICY.PROTOCOL;
  const isDriveHost = hosts.includes(url.hostname);

  return isSecure && isDriveHost;
};

export const canOpenJennySource = ({ source, canOpenSources }: IJennySourceAccess) =>
  canOpenSources && isAllowedSourceUrl(source.url);

export const formatJennyAnswerAnnouncement = (answer: string) =>
  `${JENNY_COPY.ANSWER_ANNOUNCEMENT_PREFIX}${toMarkdownPlainText(answer)}`;

export const getJennySheetTransitionDuration = (prefersReducedMotion: boolean) => {
  if (prefersReducedMotion) {
    return JENNY_SHEET_TRANSITION_MS.REDUCED_MOTION;
  }

  return JENNY_SHEET_TRANSITION_MS.STANDARD;
};
