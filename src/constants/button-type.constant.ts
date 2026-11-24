export const BUTTON_TYPES = {
  RESET: "reset",
  BUTTON: "button",
  SUBMIT: "submit",
} as const;

export type NativeButtonType = (typeof BUTTON_TYPES)[keyof typeof BUTTON_TYPES];
