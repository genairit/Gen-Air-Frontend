import { Box } from "@mui/material";
import type { DatePickerValue } from "../../DatePicker";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers";
import { DAY_CELL_CLASS } from "../../constants/date-picker.constant";
import { getRangePosition, isDateSelected } from "../../utilities/day.utility";

interface IDayBubbleProps<IsRange extends boolean = false> extends PickerDayProps {
  isRange: IsRange;
  calendarValue: DatePickerValue<IsRange>;
}

const DayBubble = <IsRange extends boolean = false>({
  day,
  isRange,
  disabled,
  calendarValue,
  ...props
}: IDayBubbleProps<IsRange>) => {
  const isSelected = isDateSelected(day, calendarValue);
  const rangePosition = getRangePosition(day, calendarValue);

  return (
    <Box
      component="span"
      data-range={isRange}
      className={DAY_CELL_CLASS}
      data-selected={isSelected}
      data-range-position={rangePosition}
    >
      <PickerDay
        {...props}
        day={day}
        disableRipple
        selected={false}
        disableTouchRipple
        disabled={disabled}
        disableHighlightToday
      />
    </Box>
  );
};

export default DayBubble;
