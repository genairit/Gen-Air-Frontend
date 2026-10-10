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
import { theme } from "../../../constants/theme.constants";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import { validateFreeText } from "../../../utilities/validators";
import CardHeader from "../../../components/CardHeader/CardHeader";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import type { IApiProjectStage } from "../../../interfaces/api.interface";
import { CHIP_SIZES, CHIP_VARIANTS } from "../../../constants/chip.constant";
import type { IProjectFormValues } from "../../../interfaces/project.interface";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface IProjectDetailsCardProps {
  mode: ProjectFormModeType;
  projectCode: string | null;
  values: IProjectFormValues;
  stages: IApiProjectStage[];
  onChange: (changes: Partial<IProjectFormValues>) => void;
}

const ProjectDetailsCard: FC<IProjectDetailsCardProps> = ({
  mode,
  values,
  stages,
  onChange,
  projectCode,
}) => {
  const styles = usePageStyles();
  const copy = PROJECT_FORM_MODE_COPY[mode];
  const stageOptions = toOptions(stages);
  const isEditMode = mode === PROJECT_FORM_MODES.EDIT;
  const stageLabel = findOptionLabelById(stageOptions, values.stageId);

  const modeBadge = isEditMode ? (
    <Chip size={CHIP_SIZES.MEDIUM} label={stageLabel ?? ""} dotColor={theme.palette.orange} />
  ) : (
    <Chip
      isMonospace
      size={CHIP_SIZES.MEDIUM}
      variant={CHIP_VARIANTS.INSET}
      label={projectCode ?? PROJECT_FORM_COPY.PENDING_CODE}
    />
  );

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
            type={FIELD_TYPES.TEXT}
            validator={validateFreeText}
            startIcon={ICON_NAMES.BUILDING}
            title={PROJECT_FORM_COPY.NAME_LABEL}
            onChange={name => onChange({ name })}
            infoText={PROJECT_FORM_COPY.NAME_HINT}
          />
        </Box>
        {isEditMode && (
          <Autocomplete
            isRequired
            value={stageLabel}
            isAutocomplete={false}
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
