import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "../../Button/Button";
import RowStatusChip from "./RowStatusChip";
import { useStyles } from "../ApartmentImport.style";
import ImportSummaryTiles from "./ImportSummaryTiles";
import { BUTTON_VARIANTS } from "../../Button/constants/button.constants";
import { getApartmentImportSummary } from "../../../utilities/apartment-import.utility";
import type { IApartmentImportResult } from "../../../interfaces/apartment-import.interface";

interface IImportResultsProps {
  onRetry: () => void;
  result: IApartmentImportResult;
  onDownloadReport: () => Promise<void>;
}

const ImportResults: FC<IImportResultsProps> = ({ result, onRetry, onDownloadReport }) => {
  const styles = useStyles();
  const summary = getApartmentImportSummary(result.counts);
  const hasSkipped = result.rows.length > 0;
  const partial = result.counts.error > 0 || result.counts.duplicate > 0;
  const bannerStyle = styles.result({ partial });
  const markerStyle = styles.resultMarker({ partial });
  const marker = partial ? "!" : "✓";
  const description = hasSkipped
    ? "דירות קיימות לא עודכנו ולא נמחקו. השורות שלא נקלטו מוצגות להלן."
    : "הייבוא הסתיים. דירות קיימות לא עודכנו ולא נמחקו.";
  return (
    <Box sx={styles.stack}>
      <Box role="status" sx={bannerStyle}>
        <Box sx={markerStyle} aria-hidden="true">
          {marker}
        </Box>
        <Box sx={styles.resultText}>
          <Box component="b" sx={styles.resultTitle}>
            {summary}
          </Box>
          <Box>{description}</Box>
        </Box>
      </Box>
      <ImportSummaryTiles counts={result.counts} />
      {hasSkipped && (
        <Box sx={styles.rows} aria-label="שורות שלא נקלטו">
          {result.rows.map(row => {
            const rowStyle = styles.row({ status: row.status });
            return (
              <Box sx={rowStyle} key={row.rowNumber}>
                <Box sx={styles.code}>שורה {row.rowNumber}</Box>
                <Box component="b">דירה {row.apartment}</Box>
                <RowStatusChip status={row.status} />
                <Box>{row.reason}</Box>
              </Box>
            );
          })}
        </Box>
      )}
      {hasSkipped && (
        <Box sx={styles.report}>
          <Box sx={styles.reportText}>
            <Box component="b">דוח שורות שלא נקלטו</Box>
            <Box sx={styles.muted}>
              אקסל עם העמודות המקוריות ועמודת ״סיבה״. בייבוא חוזר, דירות שכבר נקלטו ידולגו ולא
              ישתנו.
            </Box>
          </Box>
          <Box sx={styles.actions}>
            <Button
              onClick={onDownloadReport}
              text="הורד דוח שגיאות (.xlsx)"
              variant={BUTTON_VARIANTS.NEUTRAL}
            />
            <Button onClick={onRetry} text="העלה קובץ מתוקן" variant={BUTTON_VARIANTS.NEUTRAL} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ImportResults;
