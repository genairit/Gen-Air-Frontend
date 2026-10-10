import { type MouseEvent } from "react";
import { Close } from "@mui/icons-material";
import { Box, Tooltip } from "@mui/material";
import { useStyles } from "./FreeTextChip.style";
import type { TFreeTextStatusType } from "../../../constants/free-text.constants";
import { getFreeTextChipLabel, getFreeTextChipPalette } from "../../../utilities/free-text.utility";

interface IFreeTextChipProps {
  word: string;
  onEdit: () => void;
  isReadonly?: boolean;
  onRemove: () => void;
  status: TFreeTextStatusType | null;
}

const preventDefault = (event: MouseEvent<HTMLSpanElement>): void => {
  event.preventDefault();
};

const FreeTextChip = ({ word, status, onEdit, onRemove, isReadonly }: IFreeTextChipProps) => {
  const palette = getFreeTextChipPalette(status);
  const styles = useStyles({ palette });

  const handleEditClick = (): void => {
    if (isReadonly) {
      return;
    }

    onEdit();
  };

  const handleRemoveClick = (event: MouseEvent<HTMLSpanElement>): void => {
    event.stopPropagation();
    onRemove();
  };

  return (
    <Tooltip arrow title={getFreeTextChipLabel(status)}>
      <Box sx={styles.chip} component="span" onClick={handleEditClick} onMouseDown={preventDefault}>
        <Box component="span" sx={styles.chipWord}>
          {word}
        </Box>

        {!isReadonly && (
          <Box
            component="span"
            sx={styles.chipRemove}
            onClick={handleRemoveClick}
            onMouseDown={preventDefault}
          >
            <Close fontSize="inherit" />
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default FreeTextChip;
