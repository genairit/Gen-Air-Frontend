import {
  formatUrgencyPreviewTitle,
  formatUrgencyPreviewSender,
} from "../../utilities/task.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./UrgencyConfirmPopup.style";

interface IUrgencyPushPreviewProps {
  taskTitle: string;
  recipient: string;
  detailLine: string;
}

const UrgencyPushPreview: FC<IUrgencyPushPreviewProps> = ({ taskTitle, recipient, detailLine }) => {
  const styles = useStyles();

  return (
    <Box sx={styles.preview}>
      <Box component="span" sx={styles.previewSender}>
        {formatUrgencyPreviewSender(recipient)}
      </Box>
      <Box component="b" sx={styles.previewTitle}>
        {formatUrgencyPreviewTitle(taskTitle)}
      </Box>
      <Box component="span" sx={styles.previewBody}>
        {detailLine}
      </Box>
    </Box>
  );
};

export default UrgencyPushPreview;
