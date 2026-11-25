import type { FC } from "react";
import { Box } from "@mui/material";
import JennyMessage from "./JennyMessage";
import JennyEmptyState from "./JennyEmptyState";
import JennyErrorNotice from "./JennyErrorNotice";
import { useThreadStyles } from "../JennyThread.style";
import JennyTypingIndicator from "./JennyTypingIndicator";
import { VISUALLY_HIDDEN } from "../../../styles/templates.style";
import type { IJennyChat } from "../../../interfaces/jenny.interface";
import { getJennyThreadVersion } from "../../../utilities/jenny.utility";
import { useScrollPinnedToBottom } from "../../../hooks/scroll-pinned-bottom.hook";
import { JENNY_COPY, JENNY_SCROLL_PIN_THRESHOLD_PX } from "../../../constants/jenny.constant";

interface IJennyThreadProps {
  chat: IJennyChat;
  canOpenSources: boolean;
  onRetry: () => Promise<void>;
}

const JennyThread: FC<IJennyThreadProps> = ({ chat, onRetry, canOpenSources }) => {
  const styles = useThreadStyles();

  const { containerRef, trackPinnedState } = useScrollPinnedToBottom<HTMLDivElement>({
    threshold: JENNY_SCROLL_PIN_THRESHOLD_PX,
    contentVersion: getJennyThreadVersion(chat),
  });

  return (
    <>
      <Box
        role="log"
        tabIndex={0}
        aria-live="off"
        ref={containerRef}
        sx={styles.thread}
        onScroll={trackPinnedState}
        aria-label={JENNY_COPY.THREAD_LABEL}
      >
        {!chat.hasMessages && <JennyEmptyState />}
        {chat.messages.map(message => (
          <JennyMessage key={message.id} message={message} canOpenSources={canOpenSources} />
        ))}
        {chat.isWaiting && <JennyTypingIndicator />}
        {chat.error && <JennyErrorNotice onRetry={onRetry} error={chat.error} />}
      </Box>
      <Box aria-live="polite" sx={VISUALLY_HIDDEN}>
        {chat.announcement}
      </Box>
    </>
  );
};

export default JennyThread;
