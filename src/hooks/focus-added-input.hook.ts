import { useLayoutEffect, useRef } from "react";
import { focusAddedInput } from "../utilities/focus.utility";

export const useFocusAddedInput = (enabled: boolean, onFocused: () => void) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const input = inputRef.current;

    if (!enabled || !input) {
      return;
    }

    focusAddedInput(input);
    onFocused();
  }, [enabled, onFocused]);

  return inputRef;
};
