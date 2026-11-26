import { useMediaQuery } from "@mui/material";
import { useId, useRef, useState } from "react";
import { focusConnectedElement } from "../utilities/focus.utility";
import { getControlledElementId } from "../utilities/aria.utility";
import { MOBILE_LAYOUT_QUERY } from "../constants/layout.constant";

export const useJennyDialog = () => {
  const panelId = useId();
  const titleId = useId();
  const isMobile = useMediaQuery(MOBILE_LAYOUT_QUERY);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const controlledPanelId = getControlledElementId({ id: panelId, isRendered: isOpen });

  const close = (): void => {
    setIsOpen(false);
    focusConnectedElement(launcherRef.current);
  };

  const toggle = (): void => {
    if (isOpen) {
      close();
      return;
    }

    setIsOpen(true);
  };

  return { isOpen, isMobile, panelId, titleId, launcherRef, controlledPanelId, close, toggle };
};
