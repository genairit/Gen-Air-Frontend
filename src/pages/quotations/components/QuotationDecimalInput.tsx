import QuotationInput from "./QuotationInput";
import { useState, type FC, type ComponentProps } from "react";
import { quotationDecimalInput } from "../../../utilities/quotation-presentation.utility";

interface IQuotationDecimalInputProps extends Omit<
  ComponentProps<typeof QuotationInput>,
  "value" | "onFocus" | "onBlur"
> {
  value: string;
}
const QuotationDecimalInput: FC<IQuotationDecimalInputProps> = ({ value, ...props }) => {
  const [focused, setFocused] = useState(false);
  const displayed = focused ? value : quotationDecimalInput(value);
  return (
    <QuotationInput
      value={displayed}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
};
export default QuotationDecimalInput;
