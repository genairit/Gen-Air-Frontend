import type { FC } from "react";
import { Close } from "@mui/icons-material";
import WizardStepper from "./WizardStepper";
import { useStyles } from "../ApartmentImport.style";
import { Box, DialogTitle, IconButton } from "@mui/material";
import { APARTMENT_IMPORT } from "../../../constants/apartment-import.constant";

interface IImportHeaderProps {
  disabled: boolean;
  activeStep: number;
  buildingName: string;
  onClose: () => Promise<void>;
}

const ImportHeader: FC<IImportHeaderProps> = ({ activeStep, disabled, buildingName, onClose }) => {
  const styles = useStyles();
  return (
    <Box dir="rtl" sx={styles.header}>
      <Box sx={styles.headerRow}>
        <Box sx={styles.heading}>
          <DialogTitle sx={styles.title}>{APARTMENT_IMPORT.TITLE}</DialogTitle>
          <Box sx={styles.muted}>אקסל רשימת דיירים · {buildingName}</Box>
        </Box>
        <IconButton aria-label="סגור" onClick={onClose} sx={styles.close} disabled={disabled}>
          <Close />
        </IconButton>
      </Box>
      <WizardStepper activeStep={activeStep} steps={APARTMENT_IMPORT.STEPS} />
    </Box>
  );
};

export default ImportHeader;
