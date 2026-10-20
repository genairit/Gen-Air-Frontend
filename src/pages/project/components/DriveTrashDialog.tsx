import type { FC } from "react";
import { useStyles } from "./DriveFileManager.style";
import Button from "../../../components/Button/Button";
import InlineError from "../../../components/InlineError/InlineError";
import { DRIVE_FILE_COPY } from "../../../constants/drive-file.constant";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box } from "@mui/material";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface IDriveTrashDialogProps {
  fileName: string;
  hasError: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DriveTrashDialog: FC<IDriveTrashDialogProps> = ({
  fileName,
  isPending,
  hasError,
  onClose,
  onConfirm,
}) => {
  const styles = useStyles();
  const close = () => {
    if (!isPending) {
      onClose();
    }
  };
  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={close}
      slotProps={{ paper: { sx: styles.dialog } }}
    >
      <DialogTitle>{DRIVE_FILE_COPY.DELETE_TITLE}</DialogTitle>
      <DialogContent>
        <Box sx={styles.stack}>
          <b>{fileName}</b>
          <span>{DRIVE_FILE_COPY.DELETE_DESCRIPTION}</span>
          {hasError && <InlineError message={DRIVE_FILE_COPY.ACTION_ERROR} />}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={close}
          disabled={isPending}
          text={DRIVE_FILE_COPY.CANCEL}
          variant={BUTTON_VARIANTS.NEUTRAL}
        />
        <Button
          onClick={onConfirm}
          disabled={isPending}
          isLoading={isPending}
          text={DRIVE_FILE_COPY.DELETE_CONFIRM}
          ariaLabel={DRIVE_FILE_COPY.DELETE_CONFIRM}
        />
      </DialogActions>
    </Dialog>
  );
};
export default DriveTrashDialog;
