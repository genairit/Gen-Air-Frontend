import { Box } from "@mui/material";
import Button from "../../Button/Button";
import { useStyles } from "../Jenny.style";
import TextField from "../../TextField/TextField";
import type { FC, RefObject, KeyboardEvent } from "react";
import type { TJennyChat } from "../../../hooks/jenny-chat.hook";
import { isPlainEnterKey } from "../../../utilities/keyboard.utility";
import { focusConnectedElement } from "../../../utilities/focus.utility";
import { FIELD_TYPES } from "../../TextField/constants/textfield.constants";
import { JENNY_COPY, JENNY_MESSAGE_MAX_LENGTH } from "../../../constants/jenny.constant";

interface IJennyComposerProps {
  chat: TJennyChat;
  isFullScreen: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}

const JennyComposer: FC<IJennyComposerProps> = ({ chat, inputRef, isFullScreen }) => {
  const styles = useStyles();

  const handleKeyDown = async (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isPlainEnterKey(event)) {
      return;
    }

    event.preventDefault();
    await chat.sendDraft();
  };

  const handleSendClick = async () => {
    focusConnectedElement(inputRef.current);
    await chat.sendDraft();
  };

  return (
    <Box sx={styles.composer({ isFullScreen })}>
      <Box sx={styles.composerField}>
        <TextField
          multiline
          minRows={1}
          maxRows={4}
          value={chat.draft}
          inputRef={inputRef}
          type={FIELD_TYPES.TEXT}
          onChange={chat.setDraft}
          onKeyDown={handleKeyDown}
          maxLength={JENNY_MESSAGE_MAX_LENGTH}
          placeholder={JENNY_COPY.PLACEHOLDER}
          slotProps={{ htmlInput: { "aria-label": JENNY_COPY.INPUT_LABEL } }}
        />
      </Box>
      <Button text={JENNY_COPY.SEND} disabled={!chat.canSend} onClick={handleSendClick} />
    </Box>
  );
};

export default JennyComposer;
