import type { CSSProperties } from "react";
import type { SxProps } from "@mui/material";
import type { DatePickerValue } from "../DatePicker";
import { theme } from "../../../constants/theme.constants";
import { BORDER_RADIUS } from "../../../styles/templates.style";
import type { IDateRange } from "../interfaces/date-range.interface";
import { isBetweenDates, isSameDate } from "../../../utilities/date.utility";

interface ICalendarButtonStyles {
  button: SxProps;
  square: CSSProperties;
}

export const isDateRange = (
  value: DatePickerValue<boolean>
): value is IDateRange => {
  return value != null && typeof value === "object" && "startDate" in value;
};

export const isDateSelected = <IsRange extends boolean>(
  day: Date,
  value: DatePickerValue<IsRange>
): boolean => {
  if (!value) return false;

  if (!isDateRange(value)) {
    return isSameDate(value, day);
  }

  const { startDate, endDate } = value;

  if (startDate && isSameDate(startDate, day)) {
    return true;
  }

  if (endDate && isSameDate(endDate, day)) {
    return true;
  }

  return false;
};

export const isDateHighlighted = <IsRange extends boolean>(
  day: Date,
  value: DatePickerValue<IsRange>
): boolean => {
  if (!value || !isDateRange(value)) {
    return false;
  }

  const { startDate, endDate } = value;

  return isBetweenDates(day, {
    endDate: endDate || null,
    startDate: startDate || null,
  });
};

export const getBorderRadius = <IsRange extends boolean = false>(
  day: Date,
  selectedValue: DatePickerValue<IsRange> | null
): ICalendarButtonStyles => {
  const radius: ICalendarButtonStyles = { square: {}, button: {} };

  if (!selectedValue) {
    return radius;
  }

  const isSelected = isDateSelected(day, selectedValue);

  if (!isDateRange(selectedValue) && isSelected) {
    return {
      square: BORDER_RADIUS.ROUND,
      button: BORDER_RADIUS.ROUND,
    };
  }

  const { startDate, endDate } = selectedValue as IDateRange;

  if (!startDate || !endDate) {
    return {
      square: BORDER_RADIUS.ROUND,
      button: BORDER_RADIUS.ROUND,
    };
  }

  const isEndOfRange = isSameDate(day, endDate);
  const isBeginningOfRange = isSameDate(day, startDate);

  if (isEndOfRange && isBeginningOfRange) {
    return {
      square: BORDER_RADIUS.ROUND,
      button: BORDER_RADIUS.ROUND,
    };
  }

  if (isEndOfRange) {
    return {
      button: BORDER_RADIUS.ROUND,
      square: BORDER_RADIUS.LEFT_ROUND_RIGHT_FLAT,
    };
  }

  if (isBeginningOfRange) {
    return {
      button: BORDER_RADIUS.ROUND,
      square: BORDER_RADIUS.RIGHT_ROUND_LEFT_FLAT,
    };
  }

  return radius;
};

export const getColor = <IsRange extends boolean = false>(
  day: Date,
  selectedValue: DatePickerValue<IsRange>,
  disabled?: boolean
): ICalendarButtonStyles => {
  const color: ICalendarButtonStyles = { square: {}, button: {} };

  if (!selectedValue) {
    return color;
  }

  const isSelected = isDateSelected(day, selectedValue);
  const isHighlighted = isDateHighlighted(day, selectedValue);

  if (isHighlighted) {
    const squareColor = disabled ? theme.severity.info : theme.button.secondary;

    color.square = {
      backgroundColor: squareColor,
    };
    color.button = {
      color: theme.colors.white,
    };
  }

  if (isSelected) {
    const buttonColor = disabled
      ? theme.text.textfield.disabled
      : theme.button.primary;

    color.button = {
      color: theme.colors.white,
      backgroundColor: buttonColor,
      ":hover": {
        backgroundColor: buttonColor,
      },
    };
  }

  return color;
};

export const isDateDisabled = (
  day: Date,
  minDate?: Date,
  maxDate?: Date
): boolean => {
  if (minDate && day < minDate) return true;
  if (maxDate && day > maxDate) return true;

  return false;
};

export const isDatepickerValueEqual = <IsRange extends boolean>(
  a: DatePickerValue<IsRange>,
  b: DatePickerValue<IsRange>
): boolean => {
  if (a === b) return true;

  if (!isDateRange(a) && !isDateRange(b)) {
    return isSameDate(a, b);
  }

  if (isDateRange(a) && isDateRange(b)) {
    return (
      isSameDate(a.startDate, b.startDate) && isSameDate(a.endDate, b.endDate)
    );
  }

  return false;
};
