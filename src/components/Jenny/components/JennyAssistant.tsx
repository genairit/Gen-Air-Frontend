import JennyChat from "./JennyChat";
import JennyPanel from "./JennyPanel";
import JennySheet from "./JennySheet";
import Button from "../../Button/Button";
import { useStyles } from "../Jenny.style";
import { Box, useMediaQuery } from "@mui/material";
import { useId, useRef, useState, type FC } from "react";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { useJennyChat } from "../../../hooks/jenny-chat.hook";
import { JENNY_COPY } from "../../../constants/jenny.constant";
import { focusConnectedElement } from "../../../utilities/focus.utility";
import { MOBILE_LAYOUT_QUERY } from "../../../constants/layout.constant";
import type { IJennyContext } from "../../../interfaces/jenny.interface";
import { BUTTON_SIZES, BUTTON_SHAPES } from "../../Button/constants/button.constants";

interface IJennyAssistantProps {
  contextLabel: string;
  context: IJennyContext;
  canOpenSources: boolean;
}

const JennyAssistant: FC<IJennyAssistantProps> = ({ context, contextLabel, canOpenSources }) => {
  const panelId = useId();
  const titleId = useId();
  const styles = useStyles();
  const isMobile = useMediaQuery(MOBILE_LAYOUT_QUERY);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const chat = useJennyChat(context);

  const Surface = isMobile ? JennySheet : JennyPanel;

  const closeChat = () => {
    setIsOpen(false);
    focusConnectedElement(launcherRef.current);
  };

  const toggleChat = () => {
    if (isOpen) {
      closeChat();
      return;
    }

    setIsOpen(true);
  };

  return (
    <>
      <Button
        onClick={toggleChat}
        sx={styles.launcher}
        ariaExpanded={isOpen}
        icon={ICON_NAMES.AIR}
        ariaControls={panelId}
        buttonRef={launcherRef}
        size={BUTTON_SIZES.LARGE}
        shape={BUTTON_SHAPES.CIRCLE}
        ariaLabel={JENNY_COPY.LAUNCHER_LABEL}
      />
      <Surface
        isOpen={isOpen}
        panelId={panelId}
        titleId={titleId}
        onClose={closeChat}
        inputRef={inputRef}
      >
        <JennyChat
          chat={chat}
          titleId={titleId}
          onClose={closeChat}
          inputRef={inputRef}
          isFullScreen={isMobile}
          contextLabel={contextLabel}
          canOpenSources={canOpenSources}
        />
      </Surface>
      <Box aria-hidden sx={styles.mobileSpacer} />
    </>
  );
};

export default JennyAssistant;
