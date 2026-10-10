export const CHECKBOX_SHAPES = {
  SQUARE: "square",
  CIRCLE: "circle",
} as const;

export type CheckBoxShapeType = (typeof CHECKBOX_SHAPES)[keyof typeof CHECKBOX_SHAPES];

export const CONTROL_SIZES = {
  SMALL: "small",
  MEDIUM: "medium",
} as const;

export type ControlSizeType = (typeof CONTROL_SIZES)[keyof typeof CONTROL_SIZES];
