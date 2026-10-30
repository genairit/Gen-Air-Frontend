import {
  IMPORT_ROW_STATUS,
  IMPORT_STATUS_LABELS,
} from "../../../constants/apartment-import.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "../ApartmentImport.style";
import type { IApartmentImportResult } from "../../../interfaces/apartment-import.interface";

interface IImportSummaryTilesProps {
  counts: IApartmentImportResult["counts"];
}

const ImportSummaryTiles: FC<IImportSummaryTilesProps> = ({ counts }) => {
  const styles = useStyles();
  const statuses = Object.values(IMPORT_ROW_STATUS);
  return (
    <Box sx={styles.tiles}>
      {statuses.map(status => {
        const countStyle = styles.count({ status });
        return (
          <Box key={status} sx={styles.tile}>
            <Box sx={countStyle}>{counts[status]}</Box>
            <Box sx={styles.tileLabel}>{IMPORT_STATUS_LABELS[status]}</Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ImportSummaryTiles;
