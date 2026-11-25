import type { FC } from "react";
import { useStyles } from "../Jenny.style";
import SlideUpTransition from "./SlideUpTransition";
import { Dialog, useMediaQuery } from "@mui/material";
import { focusConnectedElement } from "../../../utilities/focus.utility";
import { REDUCED_MOTION_QUERY } from "../../../constants/layout.constant";
import type { IJennySurfaceProps } from "../../../interfaces/jenny.interface";
import { getJennySheetTransitionDuration } from "../../../utilities/jenny.utility";

const JennySheet: FC<IJennySurfaceProps> = ({
  isOpen,
  panelId,
  titleId,
  onClose,
  children,
  inputRef,
}) => {
  const styles = useStyles();
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  const focusInput = () => focusConnectedElement(inputRef.current);

  return (
    <Dialog
      fullScreen
      open={isOpen}
      onClose={onClose}
      aria-labelledby={titleId}
      slots={{ transition: SlideUpTransition }}
      transitionDuration={getJennySheetTransitionDuration(prefersReducedMotion)}
      slotProps={{
        paper: { id: panelId, sx: styles.sheetPaper },
        transition: { onEntered: focusInput },
      }}
    >
      {children}
    </Dialog>
  );
};

export default JennySheet;
