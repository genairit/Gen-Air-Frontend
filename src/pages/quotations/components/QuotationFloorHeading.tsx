import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import { Box } from "@mui/material";
import Button from "./QuotationButton";
import QuotationInput from "./QuotationInput";
import styles from "../quotation-items.module.css";
import { useState, type FC, type FormEvent } from "react";
import { BUTTON_TYPES } from "../../../constants/button-type.constant";
import type { IQuotationFloor } from "../../../interfaces/quotation.interface";

interface IQuotationFloorHeadingProps {
  last: boolean;
  first: boolean;
  disabled: boolean;
  readOnly: boolean;
  floor: IQuotationFloor;
  onMove: (direction: number) => void;
  onRename: (floor: IQuotationFloor) => void;
}

const QuotationFloorHeading: FC<IQuotationFloorHeadingProps> = ({
  floor,
  disabled,
  readOnly,
  first,
  last,
  onMove,
  onRename,
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(floor.floorName);
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!disabled && name.trim()) {
      onRename({ ...floor, floorName: name.trim() });
      setEditing(false);
    }
  };
  return (
    <Box component="tr" className={styles.floor}>
      <Box colSpan={4} component="th" scope="rowgroup">
        <Box className={styles.headingRow}>
          <Box component="span">{floor.floorName}</Box>
          {!readOnly && (
            <Box
              type="button"
              component="button"
              disabled={disabled}
              aria-expanded={editing}
              className={styles.textButton}
              aria-label={`עריכת קומה ${floor.floorName}`}
              onClick={() => {
                setName(floor.floorName);
                setEditing(!editing);
              }}
            >
              עריכה
            </Box>
          )}
        </Box>
        {editing && !readOnly && (
          <Box onSubmit={save} component="form" className={styles.floorForm}>
            <QuotationInput
              value={name}
              label="שם קומה"
              maxLength={200}
              disabled={disabled}
              onChange={event => setName(event.target.value)}
            />
            <Button
              text="שמירה"
              type={BUTTON_TYPES.SUBMIT}
              size={BUTTON_SIZES.COMPACT}
              disabled={disabled || !name.trim()}
            />
            <Button
              text="הזזת קומה למעלה"
              onClick={() => onMove(-1)}
              size={BUTTON_SIZES.COMPACT}
              disabled={disabled || first}
              variant={BUTTON_VARIANTS.NEUTRAL}
            />
            <Button
              text="הזזת קומה למטה"
              onClick={() => onMove(1)}
              disabled={disabled || last}
              size={BUTTON_SIZES.COMPACT}
              variant={BUTTON_VARIANTS.NEUTRAL}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};
export default QuotationFloorHeading;
