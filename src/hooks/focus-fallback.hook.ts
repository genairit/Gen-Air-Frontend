import { useEffect, useRef, useLayoutEffect } from "react";
import { observeElementFocus, restoreRemovedElementFocus } from "../utilities/focus.utility";
import type { IElementFocusFallback, IElementFocusRecord } from "../interfaces/focus.interface";

export const useFocusFallback = ({
  source,
  target,
  visible,
  enabled,
  identity,
}: Omit<IElementFocusFallback, "record">): void => {
  const record = useRef<IElementFocusRecord>({ identity, focused: false });
  useEffect(
    (): (() => void) => observeElementFocus({ source, visible, identity, record: record.current }),
    [source, visible, identity],
  );
  useLayoutEffect(
    (): void =>
      restoreRemovedElementFocus({
        source,
        target,
        visible,
        enabled,
        identity,
        record: record.current,
      }),
    [source, target, visible, enabled, identity],
  );
};
