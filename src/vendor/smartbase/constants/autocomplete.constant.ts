import { alpha, keyframes } from "@mui/material";
import { type IAutocompleteColors } from "../interfaces/autocomplete.interface";

export const AUTOCOMPLETE_LAYOUT = {
  PAGE_SIZE: 20,
  ROW_HEIGHT_PX: 48,
  MIN_VISIBLE_ROWS: 4,
  MAX_VISIBLE_ROWS: 10,
  DEFAULT_VISIBLE_ROWS: 6,
  SEARCH_MODE_GUTTER_PX: 16,
} as const;

export const AUTOCOMPLETE_SEARCH = {
  MIN_QUERY_LENGTH: 1,
  KEYS: ["label", "subtitle"],
} as const;

export const AUTOCOMPLETE_TEXTS = {
  CANCEL: "ביטול",
  CLEAR: "נקה בחירה",
  LOADING: "מחפשים…",
  EMPTY: "לא נמצאו תוצאות",
  PLACEHOLDER: "בחר אופציה",
} as const;

export const AUTOCOMPLETE_COLORS = {
  text: "#0F172A",
  hint: "#64748B",
  label: "#64748B",
  accent: "#1668BD",
  required: "#DE4040",
  placeholder: "#64748B",
} as const satisfies IAutocompleteColors;

const SURFACE = "#FFFFFF";

export const AUTOCOMPLETE_TOKENS = {
  SURFACE,
  BORDER: "#E2E8F0",
  BACKGROUND: "#F8FAFC",
  PANEL_GLASS: "blur(24px) saturate(180%)",
  FIELD_GLASS: "blur(12px) saturate(180%)",
  EASE_OUT: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  BACKDROP_GLASS: "blur(24px) saturate(160%)",
  FONT_FAMILY: "Rubik, 'Segoe UI', system-ui, sans-serif",
  FIELD_DEPTH_SHADOW: "inset 0 -8px 14px -10px rgba(15, 23, 42, 0.12)",
  FIELD_FILL: `linear-gradient(180deg, ${alpha(SURFACE, 0.96)} 0%, ${alpha("#EFF6FD", 0.9)} 100%)`,
  FLOAT_SHADOW: "0 10px 30px -10px rgba(15, 23, 42, 0.22), 0 2px 6px -2px rgba(15, 23, 42, 0.08)",
  GLASS_RIM_SHADOW: `inset 0 1px 0.5px ${alpha(SURFACE, 0.92)}, inset 1px 0 0.5px ${alpha(SURFACE, 0.48)}, inset 0 -1px 1px ${alpha(SURFACE, 0.24)}`,
} as const;

export const AUTOCOMPLETE_MOTION = {
  SPIN_MS: 800,
  BACKDROP_MS: 200,
  DROP_DOWN_MS: 200,
  SEARCH_EXIT_MS: 220,
  SEARCH_TOP_ENTER_MS: 300,
  SEARCH_RESULTS_ENTER_MS: 340,
  SEARCH_RESULTS_DELAY_MS: 30,
} as const;

export const AUTOCOMPLETE_ANIMATIONS = {
  DROP_DOWN_ENTER: keyframes`
    from { opacity: 0; transform: translateY(-4px) scale(0.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  `,
  DROP_DOWN_EXIT: keyframes`
    from { opacity: 1; transform: translateY(0) scale(1); }
    to { opacity: 0; transform: translateY(-4px) scale(0.985); }
  `,
  FADE_IN: keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  FADE_OUT: keyframes`
    from { opacity: 1; }
    to { opacity: 0; }
  `,
  SEARCH_TOP_ENTER: keyframes`
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  `,
  SEARCH_TOP_EXIT: keyframes`
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(12px); }
  `,
  SEARCH_RESULTS_ENTER: keyframes`
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  `,
  SEARCH_RESULTS_EXIT: keyframes`
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(20px); }
  `,
  SPIN: keyframes`
    to { transform: rotate(360deg); }
  `,
} as const;
