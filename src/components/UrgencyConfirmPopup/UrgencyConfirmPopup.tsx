import type { FC } from "react";
import { Box } from "@mui/material";
import UrgencyPushPreview from "./UrgencyPushPreview";
import GenericPopup from "../GenericPopup/GenericPopup";
import { useStyles } from "./UrgencyConfirmPopup.style";
import { URGENCY_CONFIRM_COPY } from "../../constants/task.constant";
import { getUrgencyConfirmationBody } from "../../utilities/task.utility";
import type { IUrgencyConfirmation } from "../../interfaces/task.interface";

interface IUrgencyConfirmPopupProps {
  detailLine: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  confirmation: IUrgencyConfirmation | null;
}

const UrgencyConfirmPopup: FC<IUrgencyConfirmPopupProps> = ({
  onClose,
  onConfirm,
  detailLine,
  confirmation,
}) => {
  const styles = useStyles();
  const isSetting = confirmation?.kind === "set";

  return (
    <GenericPopup
      align="right"
      onClose={onClose}
      open={Boolean(confirmation)}
      title={isSetting ? URGENCY_CONFIRM_COPY.SET_TITLE : URGENCY_CONFIRM_COPY.CLEAR_TITLE}
      buttons={{
        secondary: { text: URGENCY_CONFIRM_COPY.CANCEL },
        primary: {
          onClick: onConfirm,
          text: isSetting ? URGENCY_CONFIRM_COPY.CONFIRM_SET : URGENCY_CONFIRM_COPY.CONFIRM_CLEAR,
        },
      }}
      content={
        confirmation && (
          <Box sx={styles.content}>
            <Box component="span" sx={styles.body}>
              {getUrgencyConfirmationBody(confirmation)}
            </Box>
            {isSetting && (
              <UrgencyPushPreview
                detailLine={detailLine}
                taskTitle={confirmation.taskTitle}
                recipient={confirmation.recipient}
              />
            )}
          </Box>
        )
      }
    />
  );
};

export default UrgencyConfirmPopup;
