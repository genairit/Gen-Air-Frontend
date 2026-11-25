import {
  isSendableDraft,
  createJennyMessage,
  getJennyErrorFeedback,
  formatJennyAnswerAnnouncement,
} from "../utilities/jenny.utility";

import { useState } from "react";
import { logger } from "../utilities/logger.utility";
import { JENNY_ROLES } from "../constants/jenny.constant";
import { useAskJennyMutation } from "./mutations/jenny.mutation";
import type { IJennyContext, IJennyThreadMessage } from "../interfaces/jenny.interface";

export const useJennyChat = (context: IJennyContext) => {
  const [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [messages, setMessages] = useState<IJennyThreadMessage[]>([]);

  const askMutation = useAskJennyMutation();

  const isWaiting = askMutation.isPending;
  const hasMessages = messages.length > 0;
  const canSend = isSendableDraft(draft) && !isWaiting;
  const canStartNewChat = hasMessages && !isWaiting;
  const error = askMutation.isError ? getJennyErrorFeedback(askMutation.error) : null;

  const requestAnswer = async (history: IJennyThreadMessage[]) => {
    try {
      const answer = await askMutation.mutateAsync({ context, messages: history });

      setMessages(current => [...current, answer]);
      setAnnouncement(formatJennyAnswerAnnouncement(answer.content));
    } catch (requestError) {
      logger.error("Jenny chat request failed", { error: requestError, context });
    }
  };

  const sendDraft = async () => {
    if (!canSend) {
      return;
    }

    const question = createJennyMessage({ role: JENNY_ROLES.USER, content: draft.trim() });
    const history = [...messages, question];

    setDraft("");
    setMessages(history);
    await requestAnswer(history);
  };

  const retry = async () => {
    await requestAnswer(messages);
  };

  const startNewChat = () => {
    askMutation.reset();
    setMessages([]);
    setAnnouncement("");
  };

  return {
    draft,
    error,
    retry,
    canSend,
    setDraft,
    messages,
    sendDraft,
    isWaiting,
    hasMessages,
    announcement,
    startNewChat,
    canStartNewChat,
  };
};

export type TJennyChat = ReturnType<typeof useJennyChat>;
