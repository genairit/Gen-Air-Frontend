import {
  JENNY_COPY,
  JENNY_ROLES,
  JENNY_TYPING_DOT_DELAYS_MS,
} from "../../../constants/jenny.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { useThreadStyles } from "../JennyThread.style";

const JennyTypingIndicator: FC = () => {
  const styles = useThreadStyles();

  return (
    <Box role="status" sx={styles.bubble(JENNY_ROLES.ASSISTANT)}>
      <Box sx={styles.typing}>
        <Box aria-hidden sx={styles.typingDots}>
          {JENNY_TYPING_DOT_DELAYS_MS.map(delayMs => (
            <Box key={delayMs} sx={styles.typingDot(delayMs)} />
          ))}
        </Box>
        {JENNY_COPY.THINKING}
      </Box>
    </Box>
  );
};

export default JennyTypingIndicator;
