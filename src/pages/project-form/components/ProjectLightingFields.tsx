import {
  getLightingHeightError,
  validateConstraintField,
} from "../../../utilities/project-constraints.utility";

import {
  PROJECT_CONSTRAINTS,
  PROJECT_CONSTRAINT_COPY,
} from "../../../constants/project-constraints.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./ProjectLighting.style";
import Switch from "../../../components/Switch/Switch";
import TextField from "../../../components/TextField/TextField";
import type { IProjectFormValues } from "../../../interfaces/project.interface";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface IProjectLightingFieldsProps {
  isSubmitAttempted: boolean;
  values: IProjectFormValues;
  onChange: (changes: Partial<IProjectFormValues>) => void;
}

const ProjectLightingFields: FC<IProjectLightingFieldsProps> = ({
  values,
  onChange,
  isSubmitAttempted,
}) => {
  const styles = useStyles();
  const heightError = getLightingHeightError(values);
  const showError = isSubmitAttempted || values.generalLightingCeilingLoweringHeight.trim() !== "";
  const visibleError = showError ? heightError : "";
  const unit = (
    <Box component="span" sx={styles.unit}>
      {PROJECT_CONSTRAINT_COPY.HEIGHT_UNIT}
    </Box>
  );

  const heightValidator = () => validateConstraintField(visibleError);

  const handleToggle = (enabled: boolean) =>
    onChange({
      hasGeneralLightingCeilingLowering: enabled,
      generalLightingCeilingLoweringHeight: enabled
        ? values.generalLightingCeilingLoweringHeight
        : "",
    });

  return (
    <Box sx={styles.container}>
      <Box sx={styles.toggle}>
        <Box sx={styles.copy}>
          <Box component="b" sx={styles.title}>
            {PROJECT_CONSTRAINT_COPY.LIGHTING_TITLE}
          </Box>
          <Box component="span" sx={styles.subtitle}>
            {PROJECT_CONSTRAINT_COPY.LIGHTING_SUBTITLE}
          </Box>
        </Box>
        <Switch
          label=""
          onChange={handleToggle}
          value={values.hasGeneralLightingCeilingLowering}
          ariaLabel={PROJECT_CONSTRAINT_COPY.LIGHTING_TITLE}
        />
      </Box>
      {values.hasGeneralLightingCeilingLowering && (
        <Box sx={styles.height}>
          <TextField
            isLtr
            isRequired
            endAdornment={unit}
            type={FIELD_TYPES.TEXT}
            validator={heightValidator}
            title={PROJECT_CONSTRAINT_COPY.HEIGHT_LABEL}
            infoText={PROJECT_CONSTRAINT_COPY.HEIGHT_HINT}
            slotProps={PROJECT_CONSTRAINTS.HEIGHT_INPUT_SLOTS}
            value={values.generalLightingCeilingLoweringHeight}
            placeholder={PROJECT_CONSTRAINT_COPY.HEIGHT_PLACEHOLDER}
            onChange={generalLightingCeilingLoweringHeight =>
              onChange({ generalLightingCeilingLoweringHeight })
            }
          />
        </Box>
      )}
    </Box>
  );
};
export default ProjectLightingFields;
