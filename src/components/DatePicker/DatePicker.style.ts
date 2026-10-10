import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const useStyles = () =>
  createStyles({
    container: ({ disabled = false }) =>
      ({
        width: "100%",
        pointerEvents: disabled ? "none" : "auto",
      } as const),
    root: {
      direction: "ltr", // Mui requires this to be set for proper layout
      "& .MuiDayCalendar-monthContainer": {
        borderTop: "1px solid #E5E5E5",
      },
      "& .MuiPickersDay-dayOutsideMonth": {
        color: "text.disabled",
      },
      "& .MuiPickersCalendarHeader-label": {
        fontSize: "16px",
        fontWeight: 600,
        color: theme.colors.black,
      },
      "& .MuiDayCalendar-weekDayLabel": {
        fontSize: "14px",
        fontWeight: 600,
        color: theme.colors.black,
      },
      "& .MuiPickersCalendarHeader-labelContainer": {
        margin: "0",
      },
      "& .MuiPickersCalendarHeader-root": {
        justifyContent: "space-between",
      },
    },
  });
