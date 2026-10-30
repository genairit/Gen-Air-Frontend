import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "../ApartmentImport.style";

interface IWizardStepperProps {
  activeStep: number;
  steps: readonly string[];
}

const WizardStepper: FC<IWizardStepperProps> = ({ steps, activeStep }) => {
  const styles = useStyles();
  const finished = activeStep === steps.length - 1;
  return (
    <Box component="ol" sx={styles.steps} aria-label="שלבי הייבוא">
      {steps.map((label, index) => {
        const active = index === activeStep;
        const complete = index < activeStep;
        const markerStyle = styles.marker({ active, complete });
        const labelStyle = styles.stepLabel({ active });
        const connectorStyle = styles.connector({ complete });
        const stepNumber = complete || finished ? "✓" : index + 1;
        return (
          <Box key={label} component="li" sx={styles.step}>
            <Box sx={markerStyle}>{stepNumber}</Box>
            <Box sx={labelStyle}>{label}</Box>
            <Box aria-hidden="true" sx={connectorStyle} />
          </Box>
        );
      })}
    </Box>
  );
};

export default WizardStepper;
