import {
  BUTTON_SIZES,
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import type { FC, ComponentProps } from "react";
import Button from "../../../components/Button/Button";
import { mergeSx } from "../../../utilities/sx.utility";
import { QUOTATION_BUTTON_HEIGHT } from "../../../constants/quotation.constant";
import { QUOTATION_PRIMARY_DISABLED_STYLE } from "../../../constants/quotation.constant";

const QuotationButton: FC<ComponentProps<typeof Button>> = ({
  sx,
  size = BUTTON_SIZES.MEDIUM,
  shape = BUTTON_SHAPES.PILL,
  ...props
}) => {
  const height = QUOTATION_BUTTON_HEIGHT[size][shape];
  const width = shape === BUTTON_SHAPES.CIRCLE ? height : "auto";
  const variant = props.variant ?? BUTTON_VARIANTS.PRIMARY;
  const disabledStyle = variant === BUTTON_VARIANTS.PRIMARY ? QUOTATION_PRIMARY_DISABLED_STYLE : {};
  const dimensions = { height, width, minWidth: width, ...disabledStyle };
  const styles = mergeSx(dimensions, sx ?? null);
  return <Button sx={styles} size={size} shape={shape} {...props} />;
};
export default QuotationButton;
