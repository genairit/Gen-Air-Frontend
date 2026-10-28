import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "../ApartmentImport.style";

interface IWizardStepperProps {
  activeStep: number;
  steps: readonly string[];
}

const WizardStepper: FC<IWizardStepperProps> = ({ steps, activeStep }) => {
  const styles = useStyles();
  return (
    <Box component="ol" sx={styles.steps} aria-label="שלבי הייבוא">
      {steps.map((label, index) => {
        const active = index <= activeStep;
        const markerStyle = styles.marker({ active });
        const stepNumber = index + 1;
        return (
          <Box key={label} component="li" sx={styles.step}>
            <Box sx={markerStyle}>{stepNumber}</Box>
            <Box>{label}</Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default WizardStepper;
