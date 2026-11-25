import {
  JENNY_COPY,
  JENNY_COMPOSER_ROWS,
  JENNY_MESSAGE_MAX_LENGTH,
} from "../../../constants/jenny.constant";

import { Box } from "@mui/material";
import Button from "../../Button/Button";
import { useStyles } from "../Jenny.style";
import TextField from "../../TextField/TextField";
import type { FC, RefObject, KeyboardEvent } from "react";
import type { IJennyChat } from "../../../interfaces/jenny.interface";
import { isPlainEnterKey } from "../../../utilities/keyboard.utility";
import { focusConnectedElement } from "../../../utilities/focus.utility";
import { FIELD_TYPES } from "../../TextField/constants/textfield.constants";

interface IJennyComposerProps {
  chat: IJennyChat;
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
          value={chat.draft}
          inputRef={inputRef}
          type={FIELD_TYPES.TEXT}
          onChange={chat.setDraft}
          onKeyDown={handleKeyDown}
          minRows={JENNY_COMPOSER_ROWS.MIN}
          maxRows={JENNY_COMPOSER_ROWS.MAX}
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
