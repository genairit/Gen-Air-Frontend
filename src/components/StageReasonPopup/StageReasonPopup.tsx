import { Box } from "@mui/material";
import { type FC, useState } from "react";
import StageReasonField from "./StageReasonField";
import InlineError from "../InlineError/InlineError";
import { useStyles } from "./StageReasonPopup.style";
import GenericPopup from "../GenericPopup/GenericPopup";
import { logger } from "../../utilities/logger.utility";
import { useClosedCallback } from "../../hooks/closed-callback.hook";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { STAGE_REASON_COPY } from "../../constants/project-stage.constant";

interface IStageReasonPopupProps {
  open: boolean;
  title: string;
  contextText: string;
  onCancel: () => void;
  onCancelClosed?: () => void;
  onConfirm: (note: string) => Promise<void>;
}

const StageReasonPopup: FC<IStageReasonPopupProps> = ({
  open,
  title,
  onCancel,
  onConfirm,
  contextText,
  onCancelClosed,
}) => {
  const styles = useStyles();
  const [reason, setReason] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);
  const armCancelClosed = useClosedCallback(open, onCancelClosed);

  const trimmedReason = reason.trim();
  const isConfirmDisabled = !trimmedReason || isSubmitting;

  const resetReason = () => {
    setReason("");
    setIsTouched(false);
    setSubmitError(null);
  };

  const changeReason = (value: string) => {
    setReason(value);
    setIsTouched(true);
  };

  const cancel = () => {
    armCancelClosed();
    resetReason();
    onCancel();
  };

  const confirm = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await onConfirm(trimmedReason);
      resetReason();
    } catch (error) {
      logger.error("Stage move with a reason failed", { error });
      setSubmitError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GenericPopup
      dir="rtl"
      open={open}
      title={title}
      align="right"
      maxWidth="sm"
      onClose={cancel}
      closeAfterAction={false}
      closeDisabled={isSubmitting}
      buttons={{
        primary: {
          onClick: confirm,
          text: STAGE_REASON_COPY.CONFIRM,
          isDisabled: isConfirmDisabled,
        },
        secondary: { onClick: cancel, isDisabled: isSubmitting, text: STAGE_REASON_COPY.CANCEL },
      }}
      content={
        <Box sx={styles.content}>
          <Box component="p" sx={styles.context}>
            {contextText}
          </Box>
          <StageReasonField
            autoFocus
            value={reason}
            onChange={changeReason}
            disabled={isSubmitting}
            isErrorRevealed={isTouched}
          />
          {submitError !== null && <InlineError message={getApiErrorMessage(submitError)} />}
        </Box>
      }
    />
  );
};

export default StageReasonPopup;
