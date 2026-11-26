import { useState, type FC } from "react";
import TextField from "../../../components/TextField/TextField";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface IEstimateMeasurementNumberProps {
  title: string;
  busy: boolean;
  initial: number | null;
  onChange: (value: number) => void;
}

const EstimateMeasurementNumber: FC<IEstimateMeasurementNumberProps> = ({
  title,
  busy,
  initial,
  onChange,
}) => {
  const [text, setText] = useState(initial === null ? "" : String(initial));

  const change = (value: string): void => {
    setText(value);
    const isNumeric = /^(\d{1,6})(\.\d{1,4})?$/.test(value);
    onChange(isNumeric ? Number(value) : Number.NaN);
  };

  return (
    <TextField
      value={text}
      title={title}
      disabled={busy}
      onChange={change}
      type={FIELD_TYPES.NUMBER}
    />
  );
};

export default EstimateMeasurementNumber;
