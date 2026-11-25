import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "../../Button/Button";
import { useThreadStyles } from "../JennyThread.style";
import InlineError from "../../InlineError/InlineError";
import { JENNY_COPY } from "../../../constants/jenny.constant";
import type { IJennyErrorFeedback } from "../../../interfaces/jenny.interface";
import { BUTTON_SIZES, BUTTON_VARIANTS } from "../../Button/constants/button.constants";

interface IJennyErrorNoticeProps {
  error: IJennyErrorFeedback;
  onRetry: () => Promise<void>;
}

const JennyErrorNotice: FC<IJennyErrorNoticeProps> = ({ error, onRetry }) => {
  const styles = useThreadStyles();

  return (
    <Box sx={styles.error}>
      <InlineError message={error.message} />
      {error.canRetry && (
        <Button
          onClick={onRetry}
          text={JENNY_COPY.RETRY}
          size={BUTTON_SIZES.COMPACT}
          variant={BUTTON_VARIANTS.NEUTRAL}
        />
      )}
    </Box>
  );
};

export default JennyErrorNotice;
