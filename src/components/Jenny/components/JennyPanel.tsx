import { Box } from "@mui/material";
import { useStyles } from "../Jenny.style";
import { useEffect, type FC, type KeyboardEvent } from "react";
import { KEY_TYPES } from "../../../constants/keyboard.constant";
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

  const closeOnEscape = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== KEY_TYPES.ESCAPE) {
      return;
    }

    event.stopPropagation();
    onClose();
  };

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
