import {
  toOptions,
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

import {
  PROJECT_FORM_COPY,
  PROJECT_FORM_MODES,
  type ProjectFormModeType,
} from "../../../constants/project-form.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { useSessionUser } from "../../../store/session.store";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import { validateFreeText } from "../../../utilities/validators";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import type { IApiProjectStage } from "../../../interfaces/api.interface";
import { requiresStageNote } from "../../../utilities/stage-reason.utility";
import type { IProjectFormValues } from "../../../interfaces/project.interface";
import StageReasonField from "../../../components/StageReasonPopup/StageReasonField";
import { validateConstraintField } from "../../../utilities/project-constraints.utility";
import { PROJECT_CONSTRAINT_COPY } from "../../../constants/project-constraints.constant";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface IProjectDetailsCardProps {
  nameError: string;
  namePending: boolean;
  nameCheckFailed: boolean;
  mode: ProjectFormModeType;
  isSubmitAttempted: boolean;
  values: IProjectFormValues;
  stages: IApiProjectStage[];
  onRetryNameCheck: () => void;
  originalStageId: string | null;
  onChange: (changes: Partial<IProjectFormValues>) => void;
}

const ProjectDetailsCard: FC<IProjectDetailsCardProps> = ({
  mode,
  values,
  stages,
  onChange,
  nameError,
  namePending,
  nameCheckFailed,
  originalStageId,
  isSubmitAttempted,
  onRetryNameCheck,
}) => {
  const styles = usePageStyles();
  const user = useSessionUser();
  const canChangeStatus = hasPermission(user, PERMISSIONS.PROJECTS_STATUS_CHANGE);
  const stageOptions = toOptions(stages);
  const isEditMode = mode === PROJECT_FORM_MODES.EDIT;
  const nameInfo = namePending ? { infoText: PROJECT_CONSTRAINT_COPY.NAME_CHECKING } : {};
  const stageLabel = findOptionLabelById(stageOptions, values.stageId);
  const isStageNoteVisible = requiresStageNote({ stageId: values.stageId, originalStageId });

  const nameValidator = (value: string) =>
    nameError || (isSubmitAttempted && !value.trim())
      ? validateConstraintField(nameError || "יש להזין שם פרויקט")
      : validateFreeText(value);

  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      <TextField
        isRequired
        value={values.name}
        id="project-form-name"
        type={FIELD_TYPES.TEXT}
        validator={nameValidator}
        startIcon={ICON_NAMES.BUILDING}
        title={PROJECT_FORM_COPY.NAME_LABEL}
        onChange={name => onChange({ name })}
        {...nameInfo}
      />
      {nameCheckFailed && (
        <Button onClick={onRetryNameCheck} text={PROJECT_CONSTRAINT_COPY.RETRY} />
      )}
      {isEditMode && (
        <Autocomplete
          isRequired
          value={stageLabel}
          isAutocomplete={false}
          disabled={!canChangeStatus}
          title={PROJECT_FORM_COPY.STATUS_LABEL}
          options={getOptionLabels(stageOptions)}
          onChange={label => onChange({ stageId: findOptionIdByLabel(stageOptions, label) })}
        />
      )}
      {isStageNoteVisible && (
        <StageReasonField
          value={values.stageNote}
          isErrorRevealed={isSubmitAttempted}
          onChange={stageNote => onChange({ stageNote })}
        />
      )}
    </Box>
  );
};

export default ProjectDetailsCard;
