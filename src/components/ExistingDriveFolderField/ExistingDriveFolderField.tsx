import {
  DRIVE_FOLDER_MODES,
  DRIVE_FOLDER_LINK_LIMITS,
  EXISTING_DRIVE_FOLDER_COPY,
} from "../../constants/existing-drive-folder.constant";

import { Box } from "@mui/material";
import Button from "../Button/Button";
import { useId, type FC } from "react";
import TextField from "../TextField/TextField";
import RadioButton from "../RadioButton/RadioButton";
import InlineError from "../InlineError/InlineError";
import { usePageStyles } from "../../pages/page.style";
import LoadingState from "../LoadingState/LoadingState";
import { useStyles } from "./ExistingDriveFolderField.style";
import { BUTTON_VARIANTS } from "../Button/constants/button.constants";
import { toDriveFolderUrl } from "../../utilities/drive-folder.utility";
import { FIELD_TYPES } from "../TextField/constants/textfield.constants";
import { formatMissingTemplateFolders } from "../../utilities/existing-drive-folder.utility";
import type { IExistingDriveFolderState } from "../../interfaces/existing-drive-folder.interface";

interface IExistingDriveFolderFieldProps {
  disabled: boolean;
  isApartment?: boolean;
  state: IExistingDriveFolderState;
}

const ExistingDriveFolderField: FC<IExistingDriveFolderFieldProps> = ({
  state,
  disabled,
  isApartment = false,
}) => {
  const groupName = useId();
  const styles = usePageStyles();
  const fieldStyles = useStyles();
  const isExisting = state.mode === DRIVE_FOLDER_MODES.EXISTING;
  const isNew = state.mode === DRIVE_FOLDER_MODES.NEW;
  const preview = state.preview;
  const missingFolders = preview?.missingTemplateFolders ?? [];
  const missingText = formatMissingTemplateFolders(missingFolders);
  const showMissing = preview !== null && missingFolders.length > 0;
  const folderUrl = preview ? toDriveFolderUrl(preview.id) : "";

  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      <Box component="b">{EXISTING_DRIVE_FOLDER_COPY.TITLE}</Box>
      <Box
        role="radiogroup"
        sx={styles.row({ gap: "18px" })}
        aria-label={EXISTING_DRIVE_FOLDER_COPY.TITLE}
      >
        <RadioButton
          checked={isNew}
          name={groupName}
          disabled={disabled}
          value={DRIVE_FOLDER_MODES.NEW}
          label={EXISTING_DRIVE_FOLDER_COPY.NEW}
          onSelect={() => state.setMode(DRIVE_FOLDER_MODES.NEW)}
        />
        <RadioButton
          name={groupName}
          disabled={disabled}
          checked={isExisting}
          value={DRIVE_FOLDER_MODES.EXISTING}
          label={EXISTING_DRIVE_FOLDER_COPY.EXISTING}
          onSelect={() => state.setMode(DRIVE_FOLDER_MODES.EXISTING)}
        />
      </Box>
      {isNew && <Box sx={styles.caption}>{EXISTING_DRIVE_FOLDER_COPY.DEFAULT_HINT}</Box>}
      {isExisting && (
        <>
          <TextField
            isLtr
            isRequired
            disabled={disabled}
            value={state.reference}
            type={FIELD_TYPES.TEXT}
            onChange={state.setReference}
            title={EXISTING_DRIVE_FOLDER_COPY.INPUT}
            placeholder={EXISTING_DRIVE_FOLDER_COPY.PLACEHOLDER}
            maxLength={DRIVE_FOLDER_LINK_LIMITS.MAX_REFERENCE_LENGTH}
          />
          <Box sx={styles.caption}>{EXISTING_DRIVE_FOLDER_COPY.EXISTING_HINT}</Box>
          {isApartment && (
            <Box sx={styles.caption}>{EXISTING_DRIVE_FOLDER_COPY.APARTMENT_HINT}</Box>
          )}
          {state.isPending && <LoadingState label={EXISTING_DRIVE_FOLDER_COPY.CHECKING} />}
          {state.error && (
            <Box sx={styles.stack({ gap: "8px" })}>
              <InlineError message={state.error} />
              <Button
                disabled={disabled}
                onClick={state.retry}
                variant={BUTTON_VARIANTS.NEUTRAL}
                text={EXISTING_DRIVE_FOLDER_COPY.RETRY}
              />
            </Box>
          )}
          {preview && (
            <Box role="status" sx={styles.stack({ gap: "4px" })}>
              <Box dir="auto" component="b" sx={styles.wrappingText}>
                {preview.name}
              </Box>
              <Box sx={styles.caption}>{EXISTING_DRIVE_FOLDER_COPY.CHECKED}</Box>
              <Box
                component="a"
                target="_blank"
                href={folderUrl}
                sx={fieldStyles.link}
                rel="noopener noreferrer"
              >
                {EXISTING_DRIVE_FOLDER_COPY.OPEN}
              </Box>
              {showMissing && <Box sx={styles.caption}>{missingText}</Box>}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ExistingDriveFolderField;
