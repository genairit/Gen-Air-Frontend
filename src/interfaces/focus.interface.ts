import type { RefObject } from "react";

export interface IElementFocusRecord {
  focused: boolean;
  identity: unknown;
}
export interface IElementFocusObservation {
  visible: boolean;
  identity: unknown;
  record: IElementFocusRecord;
  source: RefObject<HTMLElement | null>;
}
export interface IElementFocusFallback extends IElementFocusObservation {
  enabled: boolean;
  target: RefObject<HTMLElement | null>;
}
