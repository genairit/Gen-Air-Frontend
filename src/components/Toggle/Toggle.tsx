import { TOGGLE_VALUES } from "./constants/toggle.constants";
import { type Dispatch, type FC, type SetStateAction } from "react";
import SmartbaseSegmented from "../../vendor/smartbase/components/Segmented/Segmented";

interface IToggleProps {
  value: boolean;
  firstValuePlaceHolder: string;
  secondValuePlaceHolder: string;
  handleFirstValueClick?: () => void;
  handleSecondValueClick?: () => void;
  setValue: Dispatch<SetStateAction<boolean>>;
}

const Toggle: FC<IToggleProps> = ({
  value,
  setValue,
  firstValuePlaceHolder,
  handleFirstValueClick,
  secondValuePlaceHolder,
  handleSecondValueClick,
}) => {
  const options = [
    { value: TOGGLE_VALUES.FIRST, label: firstValuePlaceHolder },
    { value: TOGGLE_VALUES.SECOND, label: secondValuePlaceHolder },
  ];

  const handleChange = (nextValue: string) => {
    const isFirst = nextValue === TOGGLE_VALUES.FIRST;
    setValue(isFirst);

    if (isFirst) {
      handleFirstValueClick?.();
      return;
    }

    handleSecondValueClick?.();
  };

  return (
    <SmartbaseSegmented
      options={options}
      onChange={handleChange}
      value={value ? TOGGLE_VALUES.FIRST : TOGGLE_VALUES.SECOND}
    />
  );
};

export default Toggle;
