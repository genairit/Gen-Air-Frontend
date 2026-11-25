import {
  JENNY_ROLES,
  type JennyRoleType,
  JENNY_SENDER_PREFIX,
} from "../../../constants/jenny.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import JennySources from "./JennySources";
import { useThreadStyles } from "../JennyThread.style";
import { VISUALLY_HIDDEN } from "../../../styles/templates.style";
import RestrictedMarkdown from "../../RestrictedMarkdown/RestrictedMarkdown";
import type { IJennyThreadMessage } from "../../../interfaces/jenny.interface";

interface IJennyMessageProps {
  canOpenSources: boolean;
  message: IJennyThreadMessage;
}

const UserMessageBody: FC<IJennyMessageProps> = ({ message }) => {
  const styles = useThreadStyles();

  return (
    <Box dir="auto" component="p" sx={styles.plainText}>
      {message.content}
    </Box>
  );
};

const AssistantMessageBody: FC<IJennyMessageProps> = ({ message, canOpenSources }) => (
  <>
    <RestrictedMarkdown markdown={message.content} />
    <JennySources sources={message.sources} canOpenSources={canOpenSources} />
  </>
);

const MESSAGE_BODY_BY_ROLE: Record<JennyRoleType, FC<IJennyMessageProps>> = {
  [JENNY_ROLES.USER]: UserMessageBody,
  [JENNY_ROLES.ASSISTANT]: AssistantMessageBody,
};

const JennyMessage: FC<IJennyMessageProps> = ({ message, canOpenSources }) => {
  const styles = useThreadStyles();
  const MessageBody = MESSAGE_BODY_BY_ROLE[message.role];

  return (
    <Box dir="auto" sx={styles.bubble(message.role)}>
      <Box component="span" sx={VISUALLY_HIDDEN}>
        {JENNY_SENDER_PREFIX[message.role]}
      </Box>
      <MessageBody message={message} canOpenSources={canOpenSources} />
    </Box>
  );
};

export default JennyMessage;
