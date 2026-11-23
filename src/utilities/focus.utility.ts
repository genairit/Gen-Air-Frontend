import type {
  IElementFocusFallback,
  IElementFocusObservation,
} from "../interfaces/focus.interface";

import { FOCUS_EVENTS } from "../constants/focus.constant";
import { ACTIVE_TAB_SELECTOR } from "../constants/tabs.constant";

export const focusAddedInput = (input: HTMLInputElement): void => {
  input.focus({ preventScroll: true });
  input.select();

  const bounds = input.getBoundingClientRect();
  const isOutsideViewport =
    bounds.top < 0 ||
    bounds.bottom > window.innerHeight ||
    bounds.left < 0 ||
    bounds.right > window.innerWidth;

  if (isOutsideViewport) {
    input.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
};

export const focusActiveTab = (tabList: HTMLElement | null): void => {
  tabList?.querySelector<HTMLElement>(ACTIVE_TAB_SELECTOR)?.focus();
};

export const focusConnectedElement = (element: HTMLElement | null): void => {
  if (element?.isConnected) {
    element.focus({ preventScroll: true });
  }
};

export const observeElementFocus = ({
  source,
  visible,
  record,
  identity,
}: IElementFocusObservation): (() => void) => {
  const element = source.current;
  const ownerDocument = element?.ownerDocument ?? null;
  if (!visible || element === null || ownerDocument === null) {
    return (): void => {};
  }

  const controller = new AbortController();
  const recordFocus = (): void => {
    record.identity = identity;
    record.focused = ownerDocument.activeElement === source.current;
  };
  const recordDeparture = (): void => {
    if (element.isConnected) {
      record.focused = false;
    }
  };
  ownerDocument.addEventListener(FOCUS_EVENTS.ENTER, recordFocus, { signal: controller.signal });
  element.addEventListener(FOCUS_EVENTS.LEAVE, recordDeparture, { signal: controller.signal });
  recordFocus();
  return (): void => controller.abort();
};

export const restoreRemovedElementFocus = ({
  source,
  target,
  record,
  visible,
  enabled,
  identity,
}: IElementFocusFallback): void => {
  const hadMatchingFocus = record.focused && record.identity === identity;
  if (visible || !enabled || !hadMatchingFocus || source.current !== null) {
    return;
  }

  const element = target.current;
  const ownerDocument = element?.ownerDocument ?? null;
  const isFocusUnclaimed =
    ownerDocument !== null && ownerDocument.activeElement === ownerDocument.body;
  if (!isFocusUnclaimed) {
    return;
  }

  record.focused = false;
  focusConnectedElement(element);
};
