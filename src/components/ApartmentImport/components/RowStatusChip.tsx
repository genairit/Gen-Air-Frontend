import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "../ApartmentImport.style";
import { IMPORT_STATUS_LABELS } from "../../../constants/apartment-import.constant";
import type { ImportRowStatusType } from "../../../interfaces/apartment-import.interface";

interface IRowStatusChipProps {
  status: ImportRowStatusType;
}

const RowStatusChip: FC<IRowStatusChipProps> = ({ status }) => {
  const styles = useStyles();
  const label = IMPORT_STATUS_LABELS[status];
  return (
    <Box component="span" sx={styles.chip}>
      {label}
    </Box>
  );
};

export default RowStatusChip;
