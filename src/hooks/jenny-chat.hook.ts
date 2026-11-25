import {
  isSendableDraft,
  createJennyMessage,
  getJennyErrorFeedback,
  formatJennyAnswerAnnouncement,
} from "../utilities/jenny.utility";

import { useState } from "react";
import { logger } from "../utilities/logger.utility";
import { JENNY_ROLES } from "../constants/jenny.constant";
import { useAbortableRequest } from "./abortable-request.hook";
import { isCancelledRequest } from "../utilities/abort.utility";
import { useAskJennyMutation } from "./mutations/jenny.mutation";
import type { IJennyContext, IJennyThreadMessage } from "../interfaces/jenny.interface";

export const useJennyChat = (context: IJennyContext) => {
  const [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [messages, setMessages] = useState<IJennyThreadMessage[]>([]);

  const askMutation = useAskJennyMutation();
  const { runAbortable, abortActive } = useAbortableRequest();

  const isWaiting = askMutation.isPending;
  const hasMessages = messages.length > 0;
  const canSend = isSendableDraft(draft) && !isWaiting;
  const canStartNewChat = hasMessages && !isWaiting;
  const error = askMutation.isError ? getJennyErrorFeedback(askMutation.error) : null;

  const askWithSignal = async (history: IJennyThreadMessage[], signal: AbortSignal) => {
    try {
      const answer = await askMutation.mutateAsync({ context, signal, messages: history });

      setMessages(current => [...current, answer]);
      setAnnouncement(formatJennyAnswerAnnouncement(answer.content));
    } catch (requestError) {
      if (isCancelledRequest(requestError, signal)) {
        return;
      }

      logger.error("Jenny chat request failed", { error: requestError, context });
    }
  };

  // The live region is cleared per request so an identical answer is announced again.
  const requestAnswer = async (history: IJennyThreadMessage[]) => {
    setAnnouncement("");
    await runAbortable(signal => askWithSignal(history, signal));
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
    abortActive();
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
