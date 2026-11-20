import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./DriveFileManager.style";
import InlineError from "../../../components/InlineError/InlineError";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import { DRIVE_FILE_COPY } from "../../../constants/drive-file.constant";

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
    <GenericPopup
      open
      onClose={close}
      closeAfterAction={false}
      closeDisabled={isPending}
      title={DRIVE_FILE_COPY.DELETE_TITLE}
      buttons={{
        primary: {
          text: DRIVE_FILE_COPY.DELETE_CONFIRM,
          isDisabled: isPending,
          onClick: onConfirm,
        },
        secondary: { text: DRIVE_FILE_COPY.CANCEL, isDisabled: isPending, onClick: close },
      }}
      content={
        <Box sx={styles.stack}>
          <Box component="b">{fileName}</Box>
          <Box component="span">{DRIVE_FILE_COPY.DELETE_DESCRIPTION}</Box>
          {hasError && <InlineError message={DRIVE_FILE_COPY.ACTION_ERROR} />}
        </Box>
      }
    />
  );
};
export default DriveTrashDialog;
