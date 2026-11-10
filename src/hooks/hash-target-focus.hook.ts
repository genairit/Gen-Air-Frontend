import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface IHashTargetFocusOptions {
  ready: boolean;
  focusId: string;
  targetId: string;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const revealHashTarget = ({ targetId, focusId }: Omit<IHashTargetFocusOptions, "ready">) => {
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  target.scrollIntoView({ block: "start", behavior: prefersReducedMotion ? "auto" : "smooth" });
  document.getElementById(focusId)?.focus({ preventScroll: true });
};

export const useHashTargetFocus = ({ ready, targetId, focusId }: IHashTargetFocusOptions) => {
  const { hash } = useLocation();
  const isTargeted = hash === `#${targetId}`;

  useEffect(() => {
    if (!ready || !isTargeted) {
      return;
    }

    revealHashTarget({ targetId, focusId });
  }, [ready, isTargeted, targetId, focusId]);
};
