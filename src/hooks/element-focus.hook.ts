import { useEffect, type RefObject } from "react";
import { focusConnectedElement } from "../utilities/focus.utility";

export const useElementFocus = (
  element: RefObject<HTMLElement | null>,
  enabled: boolean,
  trigger: unknown = enabled,
): void => {
  useEffect(() => {
    if (enabled) {
      focusConnectedElement(element.current);
    }
  }, [element, enabled, trigger]);
};
