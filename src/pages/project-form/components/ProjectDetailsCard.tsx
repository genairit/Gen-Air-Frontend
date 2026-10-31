import {
  toOptions,
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

import {
  PROJECT_FORM_COPY,
  PROJECT_FORM_MODES,
  PROJECT_FORM_MODE_COPY,
  type ProjectFormModeType,
} from "../../../constants/project-form.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import Button from "../../../components/Button/Button";
import { theme } from "../../../constants/theme.constants";
import ProjectLightingFields from "./ProjectLightingFields";
import { useSessionUser } from "../../../store/session.store";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import { validateFreeText } from "../../../utilities/validators";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import type { IApiProjectStage } from "../../../interfaces/api.interface";
import { CHIP_SIZES, CHIP_VARIANTS } from "../../../constants/chip.constant";
import type { IProjectFormValues } from "../../../interfaces/project.interface";
import { validateConstraintField } from "../../../utilities/project-constraints.utility";
import { PROJECT_CONSTRAINT_COPY } from "../../../constants/project-constraints.constant";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface IProjectDetailsCardProps {
  nameError: string;
  namePending: boolean;
  nameCheckFailed: boolean;
  mode: ProjectFormModeType;
  isSubmitAttempted: boolean;
  projectCode: string | null;
  values: IProjectFormValues;
  stages: IApiProjectStage[];
  onRetryNameCheck: () => void;
  onChange: (changes: Partial<IProjectFormValues>) => void;
}

const ProjectDetailsCard: FC<IProjectDetailsCardProps> = ({
  mode,
  values,
  stages,
  onChange,
  projectCode,
  nameError,
  namePending,
  nameCheckFailed,
  isSubmitAttempted,
  onRetryNameCheck,
}) => {
  const styles = usePageStyles();
  const user = useSessionUser();
  const canChangeStatus = hasPermission(user, PERMISSIONS.PROJECTS_STATUS_CHANGE);
  const copy = PROJECT_FORM_MODE_COPY[mode];
  const stageOptions = toOptions(stages);
  const isEditMode = mode === PROJECT_FORM_MODES.EDIT;
  const nameInfo = namePending
    ? PROJECT_CONSTRAINT_COPY.NAME_CHECKING
    : PROJECT_CONSTRAINT_COPY.NAME_HINT;
  const stageLabel = findOptionLabelById(stageOptions, values.stageId);

  const modeBadge = isEditMode ? (
    <Chip size={CHIP_SIZES.MEDIUM} label={stageLabel ?? ""} dotColor={theme.palette.primary} />
  ) : (
    <Chip
      isMonospace
      size={CHIP_SIZES.MEDIUM}
      variant={CHIP_VARIANTS.INSET}
      label={projectCode ?? PROJECT_FORM_COPY.PENDING_CODE}
    />
  );

  const nameValidator = (value: string) =>
    nameError ? validateConstraintField(nameError) : validateFreeText(value);

  return (
    <Card gap="22px" padding="28px">
      <CardHeader
        action={modeBadge}
        title={copy.detailsTitle}
        icon={ICON_NAMES.NEW_PROJECT}
        subtitle={copy.detailsSubtitle}
      />
      <Box sx={styles.grid({ minColumnWidth: 260, gap: "20px" })}>
        <Box sx={styles.spanTwoColumns}>
          <TextField
            isRequired
            value={values.name}
            infoText={nameInfo}
            type={FIELD_TYPES.TEXT}
            validator={nameValidator}
            startIcon={ICON_NAMES.BUILDING}
            title={PROJECT_FORM_COPY.NAME_LABEL}
            onChange={name => onChange({ name })}
          />
        </Box>
        <Box sx={styles.spanTwoColumns}>
          {nameCheckFailed && (
            <Button onClick={onRetryNameCheck} text={PROJECT_CONSTRAINT_COPY.RETRY} />
          )}
          <ProjectLightingFields
            values={values}
            onChange={onChange}
            isSubmitAttempted={isSubmitAttempted}
          />
        </Box>
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
      </Box>
    </Card>
  );
};

export default ProjectDetailsCard;
