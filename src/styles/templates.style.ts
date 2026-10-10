import type { CSSProperties } from "react";
import { theme } from "../constants/theme.constants";

export const BORDER_RADIUS = {
  ROUND: {
    borderRadius: "50%",
    borderTopLeftRadius: "50%",
    borderTopRightRadius: "50%",
    borderBottomLeftRadius: "50%",
    borderBottomRightRadius: "50%",
  },

  LEFT_ROUND_RIGHT_FLAT: {
    borderTopLeftRadius: "50%",
    borderTopRightRadius: "0px",
    borderBottomLeftRadius: "50%",
    borderBottomRightRadius: "0px",
  },

  RIGHT_ROUND_LEFT_FLAT: {
    borderTopLeftRadius: "0px",
    borderTopRightRadius: "50%",
    borderBottomLeftRadius: "0px",
    borderBottomRightRadius: "50%",
  },
} as const satisfies Record<string, CSSProperties>;

export const CENTERED_FLEX = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const satisfies CSSProperties;

export const ELLIPSIS_TEXT = {
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
} as const satisfies CSSProperties;

export const MUTED_CAPTION = {
  fontSize: 13,
  color: theme.palette.textMuted,
} as const satisfies CSSProperties;

export const MONOSPACE_CAPTION = {
  fontSize: 12,
  fontFamily: theme.font.mono,
  color: theme.palette.textMuted,
} as const satisfies CSSProperties;
