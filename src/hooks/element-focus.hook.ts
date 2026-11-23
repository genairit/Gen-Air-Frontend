import { useEffect, type RefObject } from "react";

const focusConnectedElement = (element: HTMLElement | null) => {
  if (element?.isConnected) {
    element.focus({ preventScroll: true });
  }
};

export const useElementFocus = (element: RefObject<HTMLElement | null>, enabled: boolean) => {
  useEffect(() => {
    if (enabled) {
      focusConnectedElement(element.current);
    }
  }, [element, enabled]);
};
