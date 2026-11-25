import { Box } from "@mui/material";
import { useStyles } from "../Jenny.style";
import { useEffect, type FC } from "react";
import { KEY_TYPES } from "../../../constants/keyboard.constant";
import { createKeyHandler } from "../../../utilities/keyboard.utility";
import { focusConnectedElement } from "../../../utilities/focus.utility";
import type { IJennySurfaceProps } from "../../../interfaces/jenny.interface";

const JennyPanelSurface: FC<Omit<IJennySurfaceProps, "isOpen">> = ({
  panelId,
  titleId,
  onClose,
  children,
  inputRef,
}) => {
  const styles = useStyles();

  useEffect(() => {
    focusConnectedElement(inputRef.current);
  }, [inputRef]);

  const closeOnEscape = createKeyHandler({ [KEY_TYPES.ESCAPE]: onClose });

  return (
    <Box
      id={panelId}
      role="dialog"
      sx={styles.panel}
      aria-modal="false"
      aria-labelledby={titleId}
      onKeyDown={closeOnEscape}
    >
      {children}
    </Box>
  );
};

const JennyPanel: FC<IJennySurfaceProps> = ({ isOpen, ...surfaceProps }) => {
  if (!isOpen) {
    return null;
  }

  return <JennyPanelSurface {...surfaceProps} />;
};

export default JennyPanel;
