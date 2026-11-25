import type { FC } from "react";
import { Box } from "@mui/material";
import JennyMark from "./JennyMark";
import { useThreadStyles } from "../JennyThread.style";
import { JENNY_COPY, JENNY_MARK_PRESETS } from "../../../constants/jenny.constant";

const JennyEmptyState: FC = () => {
  const styles = useThreadStyles();

  return (
    <Box sx={styles.empty}>
      <JennyMark preset={JENNY_MARK_PRESETS.EMPTY_STATE} />
      <Box component="p" sx={styles.greeting}>
        {JENNY_COPY.GREETING}
      </Box>
      <Box component="p" sx={styles.disclaimer}>
        {JENNY_COPY.DISCLAIMER}
      </Box>
    </Box>
  );
};

export default JennyEmptyState;
