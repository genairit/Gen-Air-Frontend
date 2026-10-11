export const KEY_TYPES = {
  ENTER: "Enter",
  ESCAPE: "Escape",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
} as const;

export type KeyType = (typeof KEY_TYPES)[keyof typeof KEY_TYPES];
