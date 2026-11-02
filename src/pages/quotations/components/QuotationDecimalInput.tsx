import QuotationInput from "./QuotationInput";
import { useState, type FC, type ComponentProps } from "react";
import { quotationDecimalInput } from "../../../utilities/quotation-presentation.utility";

interface IQuotationDecimalInputProps extends Omit<
  ComponentProps<typeof QuotationInput>,
  "value" | "onFocus" | "onBlur"
> {
  value: string;
}
const QuotationDecimalInput: FC<IQuotationDecimalInputProps> = ({ value, onChange, ...props }) => {
  const [editing, setEditing] = useState(false);
  const displayed = editing ? value : quotationDecimalInput(value);
  return (
    <QuotationInput
      value={displayed}
      onBlur={() => setEditing(false)}
      onChange={event => {
        setEditing(true);
        onChange?.(event);
      }}
      {...props}
    />
  );
};
export default QuotationDecimalInput;
