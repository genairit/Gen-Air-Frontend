import {
  CHECKBOX_SHAPES,
  type CheckBoxShapeType,
} from "../../constants/selection-control.constant";

import { type FC, type JSX } from "react";
import { theme } from "../../constants/theme.constants";
import SmartbaseCheckBox from "../../vendor/smartbase/components/CheckBox/CheckBox";

interface ICheckBoxProps {
  value: boolean;
  disabled?: boolean;
  textColor?: string;
  ariaLabel?: string;
  shape?: CheckBoxShapeType;
  text: string | JSX.Element;
  onChange: (value: boolean) => void;
}

const CheckBox: FC<ICheckBoxProps> = ({
  text,
  ariaLabel,
  onChange,
  value = false,
  disabled = false,
  shape = CHECKBOX_SHAPES.SQUARE,
  textColor = theme.palette.charcoal,
}) => {
  return (
    <SmartbaseCheckBox
      text={text}
      value={value}
      shape={shape}
      disabled={disabled}
      onChange={onChange}
      textColor={textColor}
      aria-label={ariaLabel}
    />
  );
};

export default CheckBox;
