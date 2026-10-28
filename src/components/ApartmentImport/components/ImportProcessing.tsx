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
      <ProgressBar value={progress} title="העלאת קובץ" />
    );
  return (
    <Box role="status" sx={styles.stack} aria-live="polite">
      <Box component="b">מעלה ומעבד את הקובץ…</Box>
      {progressContent}
      <Box sx={styles.muted}>{fileName}</Box>
      <Box sx={styles.muted}>יש להמתין לתוצאות לפני העלאה נוספת.</Box>
    </Box>
  );
};

export default ImportProcessing;
