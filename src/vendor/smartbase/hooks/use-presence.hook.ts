import { useEffect, useState } from "react";
import { type IPresence } from "../interfaces/presence.interface";

export const usePresence = (isOpen: boolean, exitDurationMs: number): IPresence => {
  const [isDisplayed, setIsDisplayed] = useState<boolean>(isOpen);

  useEffect(() => {
    if (isOpen) {
      const frame = window.requestAnimationFrame(() => setIsDisplayed(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const timeoutId = window.setTimeout(() => setIsDisplayed(false), exitDurationMs);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, exitDurationMs]);

  return { isDisplayed: isOpen || isDisplayed, isExiting: !isOpen && isDisplayed };
};
