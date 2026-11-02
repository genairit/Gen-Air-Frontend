import { type FC } from "react";
import { useStyles } from "./SearchModeOverlay.style";
import { Box, Modal, useTheme, ButtonBase } from "@mui/material";
import { type ISearchModeOverlayProps } from "../../../../interfaces/autocomplete.interface";

const SearchModeOverlay: FC<ISearchModeOverlayProps> = ({
  field,
  label,
  colors,
  onClose,
  children,
  labelFor,
  container,
  hasShadow,
  isExiting,
  cancelText,
  keyboardInset,
}) => {
  const styles = useStyles({ colors, hasShadow }, keyboardInset);

  const theme = useTheme();

  return (
    <Modal open hideBackdrop onClose={onClose} container={container}>
      <Box
        role="dialog"
        aria-modal="true"
        dir={theme.direction}
        aria-label={label ?? "חיפוש אפשרויות"}
        sx={[styles.overlay, isExiting && styles.overlayExit]}
      >
        <Box onMouseDown={onClose} sx={[styles.backdrop, isExiting && styles.backdropExit]} />
        <Box sx={[styles.top, isExiting && styles.topExit]}>
          {label && (
            <Box component="label" sx={styles.label} htmlFor={labelFor}>
              {label}
            </Box>
          )}
          <Box sx={styles.row}>
            {field}
            <ButtonBase onClick={onClose} sx={styles.cancelButton}>
              {cancelText}
            </ButtonBase>
          </Box>
        </Box>
        <Box sx={[styles.results, isExiting && styles.resultsExit]}>{children}</Box>
      </Box>
    </Modal>
  );
};

export default SearchModeOverlay;
