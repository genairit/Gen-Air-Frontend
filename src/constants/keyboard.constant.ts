export const KEY_TYPES = {
  ENTER: "Enter",
  ESCAPE: "Escape",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
} as const;

export type KeyType = (typeof KEY_TYPES)[keyof typeof KEY_TYPES];

export const ARROW_KEY_TYPES = {
  ARROW_UP: KEY_TYPES.ARROW_UP,
  ARROW_DOWN: KEY_TYPES.ARROW_DOWN,
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
} as const;

export type ArrowKeyType = (typeof ARROW_KEY_TYPES)[keyof typeof ARROW_KEY_TYPES];

export const RTL_ARROW_STEPS: Record<ArrowKeyType, number> = {
  [ARROW_KEY_TYPES.ARROW_UP]: -1,
  [ARROW_KEY_TYPES.ARROW_RIGHT]: -1,
  [ARROW_KEY_TYPES.ARROW_DOWN]: 1,
  [ARROW_KEY_TYPES.ARROW_LEFT]: 1,
};
