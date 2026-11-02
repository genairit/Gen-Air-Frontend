export type TButtonVariant = "primary" | "secondary" | "active" | "outlined";
export type TMuiVariant = "outlined" | "contained";

export const MUI_VARIANT_BY_BUTTON_VARIANT: Record<TButtonVariant, TMuiVariant> = {
  active: "outlined",
  primary: "contained",
  outlined: "outlined",
  secondary: "outlined",
};

export const IS_RIPPLE_DISABLED_BY_BUTTON_VARIANT: Record<TButtonVariant, boolean> = {
  active: true,
  primary: false,
  outlined: true,
  secondary: false,
};
