import {
  BUTTON_SIZES,
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
  type ButtonSizeType,
  type ButtonShapeType,
  ICON_COLOR_BY_VARIANT,
  type ButtonVariantType,
} from "./constants/button.constants";

import { Lottie } from "lottie-react";
import { useStyles } from "./Button.style";
import ButtonContent from "./ButtonContent";
import { type FC, type MouseEvent } from "react";
import { mergeSx } from "../../utilities/sx.utility";
import type { IconNameType } from "../../constants/icon.constant";
import loadingAnimation from "../../lottie/Smartbase-Loading.json";
import { type SxProps, type Theme, Button as MuiButton } from "@mui/material";

interface IButtonProps {
  text?: string;
  disabled?: boolean;
  ariaLabel?: string;
  icon?: IconNameType;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
  size?: ButtonSizeType;
  shape?: ButtonShapeType;
  variant?: ButtonVariantType;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

const Button: FC<IButtonProps> = ({
  sx,
  text,
  icon,
  onClick,
  disabled,
  ariaLabel,
  isLoading = false,
  size = BUTTON_SIZES.MEDIUM,
  shape = BUTTON_SHAPES.PILL,
  variant = BUTTON_VARIANTS.PRIMARY,
}) => {
  const styles = useStyles();
  const hasIcon = Boolean(icon);
  const hasIconBadge = variant === BUTTON_VARIANTS.PRIMARY && Boolean(text);

  return (
    <MuiButton
      disableRipple
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled || isLoading}
      sx={mergeSx(styles.button({ isLoading, variant, size, shape, hasIcon }), sx ?? null)}
    >
      {isLoading ? (
        <>
          <span style={styles.text}>{text}</span>
          <div style={styles.loadingAnimation}>
            <Lottie loop autoplay src={loadingAnimation} />
          </div>
        </>
      ) : (
        <ButtonContent
          text={text}
          icon={icon}
          hasIconBadge={hasIconBadge}
          iconColor={ICON_COLOR_BY_VARIANT[variant]}
        />
      )}
    </MuiButton>
  );
};

export default Button;
