import { Box } from "@mui/material";
import type { FC, MouseEvent } from "react";
import { APARTMENT_COLUMN_STYLES } from "../apartment-columns.style";
import CheckBox from "../../../../../../components/CheckBox/CheckBox";

interface IApartmentSelectCellProps {
  isSelected: boolean;
  onToggle: () => void;
}

const stopRowClick = (event: MouseEvent) => event.stopPropagation();

const ApartmentSelectCell: FC<IApartmentSelectCellProps> = ({ isSelected, onToggle }) => (
  <Box onClick={stopRowClick} sx={APARTMENT_COLUMN_STYLES.selectCell}>
    <CheckBox text="" value={isSelected} onChange={onToggle} />
  </Box>
);

export default ApartmentSelectCell;
