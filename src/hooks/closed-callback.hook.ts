import { useEffect, useRef } from "react";

// Runs after descendant cleanups (such as a dialog's focus restore) of the commit that closes.
export const useClosedCallback = (isOpen: boolean, onClosed: () => void) => {
  const onClosedRef = useRef(onClosed);

  useEffect(() => {
    onClosedRef.current = onClosed;
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    return () => onClosedRef.current();
  }, [isOpen]);
};
