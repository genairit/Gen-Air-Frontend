import type { FC } from "react";
import { Box, LinearProgress } from "@mui/material";
import { useStyles } from "../ApartmentImport.style";
import ProgressBar from "../../ProgressBar/ProgressBar";

interface IImportProcessingProps {
  fileName: string;
  progress: number | null;
}

const ImportProcessing: FC<IImportProcessingProps> = ({ fileName, progress }) => {
  const styles = useStyles();
  const progressContent =
    progress === null ? (
      <LinearProgress aria-label="מעבד את הקובץ" sx={styles.processingTrack} />
    ) : (
      <ProgressBar value={progress} />
    );
  return (
    <Box role="status" aria-live="polite" sx={styles.processing}>
      <Box component="b">מעלה ומעבד את הקובץ…</Box>
      <Box sx={styles.progress}>{progressContent}</Box>
      <Box sx={styles.muted}>{fileName}</Box>
      <Box sx={styles.muted}>יש להמתין לתוצאות לפני העלאה נוספת.</Box>
    </Box>
  );
};

export default ImportProcessing;
