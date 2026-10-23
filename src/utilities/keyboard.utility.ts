import {
  KEY_TYPES,
  ARROW_KEY_TYPES,
  RTL_ARROW_STEPS,
  type ArrowKeyType,
} from "../constants/keyboard.constant";

import type { KeyboardEvent } from "react";

interface IRtlArrowTargetOptions {
  key: string;
  index: number;
  count: number;
}

const VERTICAL_SIBLINGS: Record<string, (element: Element) => Element | null> = {
  [KEY_TYPES.ARROW_UP]: element => element.previousElementSibling,
  [KEY_TYPES.ARROW_DOWN]: element => element.nextElementSibling,
};

export const isArrowKey = (key: string): key is ArrowKeyType =>
  Object.values(ARROW_KEY_TYPES).some(arrowKey => arrowKey === key);

export const wrapIndex = (index: number, count: number) => (index + count) % count;

export const getRtlArrowTarget = ({ key, index, count }: IRtlArrowTargetOptions): number | null => {
  if (!isArrowKey(key)) {
    return null;
  }

  return wrapIndex(index + RTL_ARROW_STEPS[key], count);
};

export const focusGroupItem = (element: HTMLElement, index: number) => {
  const item = element.parentElement?.children.item(index) ?? null;

  if (item instanceof HTMLElement) {
    item.focus();
  }
};

export const focusSiblingOnArrow = (event: KeyboardEvent<HTMLElement>) => {
  const sibling = VERTICAL_SIBLINGS[event.key]?.(event.currentTarget) ?? null;

  if (!(sibling instanceof HTMLElement)) {
    return;
  }

  event.preventDefault();
  sibling.focus();
};
