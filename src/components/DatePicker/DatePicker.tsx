import { he } from "date-fns/locale";
import { createTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useStyles } from "./DatePicker.style";
import { ThemeProvider } from "@mui/material/styles";
import DayBubble from "./components/DayBubble/DayBubble";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import type { IDateRange } from "./interfaces/date-range.interface";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { CALENDAR_LOCALE_TEXT } from "./constants/date-picker.constant";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { isDateDisabled, isDatepickerValueEqual } from "./utilities/day.utility";

export type DatePickerValue<IsRange extends boolean> = IsRange extends true
  ? IDateRange
  : Date | null;

export interface IDatePickerProps<IsRange extends boolean> {
  minDate?: Date;
  maxDate?: Date;
  isRange: IsRange;
  disabled?: boolean;
  value: DatePickerValue<IsRange>;
  onChange?: (value: DatePickerValue<IsRange>) => void;
}

const calendarTheme = createTheme({
  direction: "ltr",
});

const DatePicker = <IsRange extends boolean>({
  value,
  minDate,
  maxDate,
  isRange,
  onChange,
  disabled = false,
}: IDatePickerProps<IsRange>) => {
  const styles = useStyles();
  const [internalValue, setInternalValue] = useState<DatePickerValue<IsRange>>(value);

  const handleChange = (value: Date) => {
    if (disabled) {
      return;
    }

    if (!isRange) {
      setInternalValue(value as DatePickerValue<IsRange>);
      return;
    }

    const { startDate, endDate } = internalValue as IDateRange;

    const isFull = startDate && endDate;
    const isEmpty = !startDate && !endDate;

    if (isFull || isEmpty) {
      setInternalValue({
        endDate: null,
        startDate: value,
      } as DatePickerValue<IsRange>);
    }

    if (startDate && !endDate) {
      setInternalValue(prev => {
        const previous = prev as IDateRange;
        if (value < startDate) {
          return {
            startDate: value,
            endDate: previous.startDate,
          } as DatePickerValue<IsRange>;
        }

        return { ...previous, endDate: value } as DatePickerValue<IsRange>;
      });
    }
  };

  useEffect(() => {
    if (!isDatepickerValueEqual(value, internalValue)) {
      onChange?.(internalValue);
    }
  }, [value, internalValue, onChange]);

  return (
    <span style={styles.container({ disabled })}>
      <ThemeProvider theme={calendarTheme}>
        <LocalizationProvider
          adapterLocale={he}
          dateAdapter={AdapterDateFns}
          localeText={CALENDAR_LOCALE_TEXT}
        >
          <DateCalendar
            views={["day"]}
            sx={styles.root}
            reduceAnimations
            maxDate={maxDate}
            minDate={minDate}
            fixedWeekNumber={6}
            disableHighlightToday
            showDaysOutsideCurrentMonth
            slots={{
              day: props => (
                <DayBubble
                  {...props}
                  isRange={isRange}
                  onDaySelect={handleChange}
                  calendarValue={internalValue}
                  disabled={isDateDisabled(props.day, minDate, maxDate) || disabled}
                />
              ),
              rightArrowIcon: ChevronLeft,
              leftArrowIcon: ChevronRight,
            }}
          />
        </LocalizationProvider>
      </ThemeProvider>
    </span>
  );
};

export default DatePicker;
