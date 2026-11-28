export const KEY_TYPES = {
  TAB: "Tab",
  ENTER: "Enter",
  ESCAPE: "Escape",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
} as const;

export type TKeyType = (typeof KEY_TYPES)[keyof typeof KEY_TYPES];
