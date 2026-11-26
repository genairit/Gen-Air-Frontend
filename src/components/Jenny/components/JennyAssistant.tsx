import JennyChat from "./JennyChat";
import JennyDialog from "./JennyDialog";
import { useRef, type FC } from "react";
import { useJennyChat } from "../../../hooks/jenny-chat.hook";
import { useJennyDialog } from "../../../hooks/jenny-dialog.hook";
import type { IJennyContext } from "../../../interfaces/jenny.interface";

interface IJennyAssistantProps {
  contextLabel: string;
  context: IJennyContext;
  canOpenSources: boolean;
}

const JennyAssistant: FC<IJennyAssistantProps> = ({ context, contextLabel, canOpenSources }) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const dialog = useJennyDialog();
  const chat = useJennyChat(context);

  return (
    <JennyDialog dialog={dialog} inputRef={inputRef}>
      <JennyChat
        chat={chat}
        inputRef={inputRef}
        onClose={dialog.close}
        titleId={dialog.titleId}
        contextLabel={contextLabel}
        isFullScreen={dialog.isMobile}
        canOpenSources={canOpenSources}
      />
    </JennyDialog>
  );
};

export default JennyAssistant;
