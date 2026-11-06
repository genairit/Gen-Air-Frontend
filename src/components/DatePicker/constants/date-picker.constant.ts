import { heIL } from "@mui/x-date-pickers/locales";

export const CALENDAR_MAX_WIDTH_PX = 340;
export const DAY_CELL_CLASS = "smartbase-date-picker-day";

export const RANGE_POSITIONS = {
  END: "end",
  START: "start",
  MIDDLE: "middle",
} as const;

export type RangePositionType = (typeof RANGE_POSITIONS)[keyof typeof RANGE_POSITIONS];

export const DATE_PICKER_OPACITIES = {
  HOVER: 0.1,
  TODAY: 0.52,
  RANGE: 0.25,
  DISABLED: 0.45,
  FOCUS_RING: 0.22,
} as const;

export const DATE_PICKER_TRANSITIONS = {
  INTERACTION: "0.16s ease",
} as const;

export const CALENDAR_LOCALE_TEXT = heIL.components.MuiLocalizationProvider.defaultProps.localeText;
