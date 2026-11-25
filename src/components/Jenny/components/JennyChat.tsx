import JennyThread from "./JennyThread";
import JennyHeader from "./JennyHeader";
import type { FC, RefObject } from "react";
import JennyComposer from "./JennyComposer";
import type { TJennyChat } from "../../../hooks/jenny-chat.hook";
import { focusConnectedElement } from "../../../utilities/focus.utility";

interface IJennyChatProps {
  titleId: string;
  chat: TJennyChat;
  onClose: () => void;
  contextLabel: string;
  isFullScreen: boolean;
  canOpenSources: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}

const JennyChat: FC<IJennyChatProps> = ({
  chat,
  titleId,
  onClose,
  inputRef,
  contextLabel,
  isFullScreen,
  canOpenSources,
}) => {
  const startNewChat = () => {
    chat.startNewChat();
    focusConnectedElement(inputRef.current);
  };

  const retryAnswer = async () => {
    focusConnectedElement(inputRef.current);
    await chat.retry();
  };

  return (
    <>
      <JennyHeader
        titleId={titleId}
        onClose={onClose}
        onNewChat={startNewChat}
        contextLabel={contextLabel}
        isFullScreen={isFullScreen}
        hasMessages={chat.hasMessages}
        canStartNewChat={chat.canStartNewChat}
      />
      <JennyThread chat={chat} onRetry={retryAnswer} canOpenSources={canOpenSources} />
      <JennyComposer chat={chat} inputRef={inputRef} isFullScreen={isFullScreen} />
    </>
  );
};

export default JennyChat;
