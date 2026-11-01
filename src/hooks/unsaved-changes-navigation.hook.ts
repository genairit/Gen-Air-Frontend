import { useEffect } from "react";
import type { Blocker } from "react-router-dom";
import { useBeforeUnload, useBlocker } from "react-router-dom";

export const useUnsavedChangesNavigation = (pending: boolean): Blocker => {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      pending && currentLocation.pathname !== nextLocation.pathname,
  );
  useBeforeUnload(event => {
    if (pending) {
      event.preventDefault();
    }
  });
  useEffect(() => {
    if (blocker.state === "blocked" && !pending) {
      blocker.proceed();
    }
  }, [blocker, pending]);
  return blocker;
};
