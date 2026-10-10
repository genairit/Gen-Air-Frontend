import type { DatePickerValue } from "../../DatePicker";
import { combineStyles } from "../../../../create-styles";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers";
import { getBorderRadius, getColor } from "../../utilities/day.utility";

interface IDayBubbleProps<
  IsRange extends boolean = false,
> extends PickerDayProps {
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
  const color = getColor(day, calendarValue, disabled);
  const borderRadius = getBorderRadius(day, calendarValue);

  return (
    <span style={{ ...borderRadius.square, ...color.square }}>
      <PickerDay
        {...props}
        day={day}
        disableRipple
        selected={false}
        autoFocus={false}
        disableTouchRipple
        disableHighlightToday
        sx={combineStyles(borderRadius.button, color.button)}
      />
    </span>
  );
};

export default DayBubble;
