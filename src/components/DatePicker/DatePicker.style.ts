import {
  DAY_CELL_CLASS,
  RANGE_POSITIONS,
  CALENDAR_MAX_WIDTH_PX,
  DATE_PICKER_OPACITIES,
  DATE_PICKER_TRANSITIONS,
} from "./constants/date-picker.constant";

import { alpha } from "@mui/material/styles";
import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    container: ({ disabled = false }) =>
      ({
        width: "100%",
        display: "block",
        direction: "rtl",
        marginInline: "auto",
        opacity: disabled ? 0.6 : 1,
        maxWidth: `${CALENDAR_MAX_WIDTH_PX}px`,
        pointerEvents: disabled ? "none" : "auto",
      }) as const,
    root: {
      width: "100%",
      height: "auto",
      maxHeight: "none",
      overflow: "visible",
      fontFamily: "inherit",
      color: theme.palette.charcoal,
      "@media (prefers-reduced-motion: reduce)": {
        "& *": { animationDuration: "0.01ms !important", transitionDuration: "0.01ms !important" },
      },

      "& .MuiPickersCalendarHeader-root": {
        padding: 0,
        gap: "12px",
        minHeight: 0,
        maxHeight: "none",
        margin: "0 0 14px",
        justifyContent: "space-between",
      },

      "& .MuiPickersCalendarHeader-labelContainer": {
        margin: 0,
        cursor: "default",
        overflow: "visible",
        fontFamily: "inherit",
      },

      "& .MuiPickersCalendarHeader-label": {
        margin: 0,
        fontWeight: 700,
        fontSize: "15px",
        letterSpacing: "normal",
        color: theme.palette.charcoal,
        fontFamily: theme.font.body,
      },

      "& .MuiPickersArrowSwitcher-root": {
        gap: "8px",
      },

      "& .MuiPickersArrowSwitcher-spacer": {
        display: "none",
      },

      "& .MuiPickersArrowSwitcher-button": {
        margin: 0,
        padding: 0,
        width: "28px",
        height: "28px",
        fontSize: "18px",
        color: theme.palette.charcoal,
        transition: `background-color ${DATE_PICKER_TRANSITIONS.INTERACTION}, color ${DATE_PICKER_TRANSITIONS.INTERACTION}, transform ${DATE_PICKER_TRANSITIONS.INTERACTION}`,

        "&:hover": {
          color: theme.button.primary,
          backgroundColor: alpha(theme.button.primary, DATE_PICKER_OPACITIES.RANGE),
        },

        "&:active": {
          transform: "scale(0.92)",
        },
      },

      "& .MuiDayCalendar-header": {
        display: "grid",
        marginBottom: "10px",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
      },

      "& .MuiDayCalendar-weekDayLabel": {
        margin: 0,
        width: "auto",
        height: "auto",
        lineHeight: 1.5,
        fontWeight: 500,
        fontSize: "13px",
        fontFamily: "inherit",
        letterSpacing: "normal",
        color: theme.palette.charcoal,
      },

      "& .MuiDayCalendar-slideTransition": {
        minHeight: 0,
        overflow: "visible",
      },

      "& .MuiDayCalendar-monthContainer": {
        rowGap: "7px",
        display: "grid",
        overflow: "visible",
      },

      "& .MuiDayCalendar-weekContainer": {
        margin: 0,
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
      },

      [`& .${DAY_CELL_CLASS}`]: {
        height: "34px",
        display: "grid",
        isolation: "isolate",
        position: "relative",
        placeItems: "center",
      },

      [`& .${DAY_CELL_CLASS}::before`]: {
        opacity: 0,
        zIndex: -1,
        content: '""',
        insetInline: 0,
        insetBlock: "4px",
        position: "absolute",
        backgroundColor: alpha(theme.button.primary, DATE_PICKER_OPACITIES.RANGE),
      },

      [`& .${DAY_CELL_CLASS}:first-of-type::before`]: {
        borderEndStartRadius: "999px",
        borderStartStartRadius: "999px",
      },

      [`& .${DAY_CELL_CLASS}:last-of-type::before`]: {
        borderEndEndRadius: "999px",
        borderStartEndRadius: "999px",
      },

      [`& [data-range-position="${RANGE_POSITIONS.MIDDLE}"]::before`]: {
        opacity: 1,
      },

      [`& [data-range-position="${RANGE_POSITIONS.START}"]::before`]: {
        opacity: 1,
        insetInlineStart: "50%",
      },

      [`& [data-range-position="${RANGE_POSITIONS.END}"]::before`]: {
        opacity: 1,
        insetInlineEnd: "50%",
      },

      [`& .${DAY_CELL_CLASS}:first-of-type[data-range-position="${RANGE_POSITIONS.END}"]::before`]:
        {
          opacity: 0,
        },

      [`& .${DAY_CELL_CLASS}:last-of-type[data-range-position="${RANGE_POSITIONS.START}"]::before`]:
        {
          opacity: 0,
        },

      "& .MuiPickersDay-root.MuiPickersDay-root, & .MuiPickerDay-root.MuiPickerDay-root": {
        margin: 0,
        border: 0,
        width: "28px",
        height: "28px",
        fontWeight: 400,
        fontSize: "14px",
        fontFamily: "inherit",
        letterSpacing: "normal",
        color: theme.palette.charcoal,
        backgroundColor: "transparent",
        fontVariantNumeric: "tabular-nums",
        transition: `background-color ${DATE_PICKER_TRANSITIONS.INTERACTION}, color ${DATE_PICKER_TRANSITIONS.INTERACTION}, box-shadow ${DATE_PICKER_TRANSITIONS.INTERACTION}, transform ${DATE_PICKER_TRANSITIONS.INTERACTION}`,

        "&:hover": {
          backgroundColor: alpha(theme.button.primary, DATE_PICKER_OPACITIES.HOVER),
        },

        "&:active": {
          transform: "scale(0.9)",
        },

        "&.MuiPickersDay-dayOutsideMonth": {
          color: theme.palette.textMuted,
        },

        "&.Mui-disabled": {
          color: alpha(theme.palette.textMuted, DATE_PICKER_OPACITIES.DISABLED),
        },

        "&.MuiPickersDay-today": {
          boxShadow: `inset 0 0 0 1.5px ${alpha(theme.button.primary, DATE_PICKER_OPACITIES.TODAY)}`,
        },

        "&.Mui-focusVisible": {
          boxShadow: `0 0 0 3px ${alpha(theme.button.primary, DATE_PICKER_OPACITIES.FOCUS_RING)}`,
        },
      },

      '& [data-selected="true"] .MuiPickersDay-root.MuiPickersDay-root.MuiPickersDay-root, & [data-selected="true"] .MuiPickerDay-root.MuiPickerDay-root.MuiPickerDay-root':
        {
          color: theme.colors.white,
          boxShadow: `0 4px 10px -4px ${theme.palette.primaryHover}`,
          background: `linear-gradient(135deg, ${theme.button.primary}, ${theme.palette.primaryHover})`,

          "&.Mui-focusVisible": {
            boxShadow: `0 0 0 3px ${alpha(theme.button.primary, DATE_PICKER_OPACITIES.FOCUS_RING)}`,
          },
        },
    },
  });
