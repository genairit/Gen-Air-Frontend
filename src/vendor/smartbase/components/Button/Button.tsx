import {
  type TButtonVariant,
  IS_RIPPLE_DISABLED_BY_BUTTON_VARIANT,
} from "./constants/button.constant";

import { useStyles } from "./Button.style";
import { Button as MuiButton } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { FC, MouseEvent, ReactNode } from "react";
import { mergeSx } from "../../../../utilities/sx.utility";
import { BUTTON_TYPES, type NativeButtonType } from "../../../../constants/button-type.constant";

interface IButtonProps {
  ariaLabel?: string;
  disabled?: boolean;
  children: ReactNode;
  sx?: SxProps<Theme>;
  isLoading?: boolean;
  type?: NativeButtonType;
  variant?: TButtonVariant;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

const Button: FC<IButtonProps> = ({
  sx,
  type = BUTTON_TYPES.BUTTON,
  children,
  onClick,
  disabled,
  ariaLabel,
  isLoading = false,
  variant = "primary",
}) => {
  const styles = useStyles();
  const showOverlay = disabled || isLoading;

  return (
    <MuiButton
      type={type}
      onClick={onClick}
      aria-busy={isLoading}
      aria-label={ariaLabel}
      disabled={disabled || isLoading}
      disableRipple={IS_RIPPLE_DISABLED_BY_BUTTON_VARIANT[variant]}
      sx={mergeSx(styles.button({ isLoading, showOverlay, variant }), sx ?? null)}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
