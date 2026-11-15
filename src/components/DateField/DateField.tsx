import {
  startOfDate,
  parseDateInput,
  formatDateInput,
  formatDateInputDisplay,
} from "../../utilities/date.utility";

import Button from "../Button/Button";
import { Box, Popover } from "@mui/material";
import { useStyles } from "./DateField.style";
import TextField from "../TextField/TextField";
import DatePicker from "../DatePicker/DatePicker";
import { CalendarMonth } from "@mui/icons-material";
import { useState, type FC, type KeyboardEvent } from "react";
import { DATE_FIELD_COPY } from "../../constants/date-field.constant";
import { FIELD_TYPES } from "../TextField/constants/textfield.constants";
import { toErrorValidator } from "../../utilities/field-feedback.utility";
import { BUTTON_SIZES, BUTTON_VARIANTS } from "../Button/constants/button.constants";

interface IDateFieldProps {
  value: string;
  title?: string;
  minDate?: Date;
  ariaLabel: string;
  disabled?: boolean;
  errorText?: string | null;
  onChange: (value: string) => void;
}

const DateField: FC<IDateFieldProps> = ({
  value,
  title,
  minDate,
  disabled = false,
  ariaLabel,
  errorText,
  onChange,
}) => {
  const styles = useStyles();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const isOpen = anchor !== null;
  const calendarMinDateProps = minDate ? { minDate: startOfDate(minDate) } : {};

  const open = (element: HTMLElement) => {
    if (!disabled) {
      setAnchor(element);
    }
  };

  const close = () => {
    anchor?.querySelector("input")?.focus();
    setAnchor(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    open(event.currentTarget);
  };

  const selectDate = (date: Date | null) => {
    if (!date) {
      return;
    }

    onChange(formatDateInput(date));
    close();
  };

  const clearDate = () => {
    onChange("");
    close();
  };

  return (
    <>
      <TextField
        isLtr
        title={title}
        disabled={disabled}
        type={FIELD_TYPES.TEXT}
        onKeyDown={handleKeyDown}
        value={formatDateInputDisplay(value)}
        validator={toErrorValidator(errorText)}
        placeholder={DATE_FIELD_COPY.PLACEHOLDER}
        onClick={event => open(event.currentTarget)}
        endAdornment={<CalendarMonth sx={styles.calendarIcon} />}
        slotProps={{
          htmlInput: {
            readOnly: true,
            "aria-label": ariaLabel,
            "aria-haspopup": "dialog",
            "aria-expanded": isOpen,
          },
        }}
      />
      <Popover
        open={isOpen}
        onClose={close}
        anchorEl={anchor}
        slotProps={{ paper: { sx: styles.popoverPaper } }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {isOpen && (
          <DatePicker
            isRange={false}
            onChange={selectDate}
            value={parseDateInput(value)}
            {...calendarMinDateProps}
          />
        )}
        {value && (
          <Box sx={styles.clearRow}>
            <Button
              onClick={clearDate}
              size={BUTTON_SIZES.COMPACT}
              text={DATE_FIELD_COPY.CLEAR}
              variant={BUTTON_VARIANTS.NEUTRAL}
            />
          </Box>
        )}
      </Popover>
    </>
  );
};

export default DateField;
