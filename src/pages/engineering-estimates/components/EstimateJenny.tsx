import EstimateGuide from "./EstimateGuide";
import { Box, Typography } from "@mui/material";
import { usePageStyles } from "../../page.style";
import { useRef, useState, type FC } from "react";
import Button from "../../../components/Button/Button";
import TextField from "../../../components/TextField/TextField";
import { JENNY_ROLES } from "../../../constants/jenny.constant";
import { useJennyDialog } from "../../../hooks/jenny-dialog.hook";
import InlineError from "../../../components/InlineError/InlineError";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import JennyDialog from "../../../components/Jenny/components/JennyDialog";
import JennyHeader from "../../../components/Jenny/components/JennyHeader";
import { useCreateEstimate } from "../../../hooks/engineering-estimate.hook";
import { useThreadStyles } from "../../../components/Jenny/JennyThread.style";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { ESTIMATE_NAME_MAX_LENGTH } from "../../../constants/engineering-estimate.constant";
import type { IEngineeringEstimate } from "../../../interfaces/engineering-estimate.interface";

interface IEstimateJennyProps {
  canBrowse: boolean;
  suspended?: boolean;
  projectId: string | null;
  estimate: IEngineeringEstimate | null;
  onCreated: (estimate: IEngineeringEstimate) => void;
}

const EstimateJenny: FC<IEstimateJennyProps> = ({
  estimate,
  projectId,
  canBrowse,
  onCreated,
  suspended = false,
}) => {
  const styles = usePageStyles();
  const threadStyles = useThreadStyles();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLElement | null>(null);
  const dialog = useJennyDialog();
  const create = useCreateEstimate();
  const trimmedName = name.trim();
  const disabled = create.isPending || trimmedName.length === 0;
  const start = (): void => {
    if (disabled || !projectId) {
      return;
    }

    create.mutate(
      { name: trimmedName, projectId },
      {
        onSuccess: (created): void => {
          setName("");
          onCreated(created);
        },
      },
    );
  };

  const guide = estimate && (
    <EstimateGuide
      estimate={estimate}
      inputRef={inputRef}
      canBrowse={canBrowse}
      onClose={dialog.close}
      titleId={dialog.titleId}
      isFullScreen={dialog.isMobile}
    />
  );
  const namePrompt = (
    <>
      <JennyHeader
        hasMessages={false}
        onClose={dialog.close}
        canStartNewChat={false}
        titleId={dialog.titleId}
        onNewChat={dialog.close}
        isFullScreen={dialog.isMobile}
        subtitlePrefix="הגדרת טיוטה · "
        contextLabel="יצירת כתב כמויות"
      />
      <Box sx={threadStyles.thread}>
        <Box sx={styles.stack({ gap: "12px" })}>
          <Typography sx={threadStyles.bubble(JENNY_ROLES.ASSISTANT)}>
            באיזה שם לקרוא לכתב הכמויות החדש?
          </Typography>
          <TextField
            value={name}
            onChange={setName}
            inputRef={inputRef}
            title="שם כתב הכמויות"
            type={FIELD_TYPES.TEXT}
            disabled={create.isPending}
            maxLength={ESTIMATE_NAME_MAX_LENGTH}
          />
          <Button
            onClick={start}
            text="יצירת טיוטה"
            disabled={disabled}
            isLoading={create.isPending}
          />
          {create.isError && <InlineError message={getApiErrorMessage(create.error)} />}
        </Box>
      </Box>
    </>
  );

  if (suspended) {
    return null;
  }

  return (
    <JennyDialog dialog={dialog} inputRef={inputRef}>
      {guide ?? namePrompt}
    </JennyDialog>
  );
};

export default EstimateJenny;
