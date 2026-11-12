import {
  BUTTON_SIZES,
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
  type ButtonSizeType,
  type ButtonShapeType,
  ICON_COLOR_BY_VARIANT,
  type ButtonVariantType,
  SMARTBASE_VARIANT_BY_BUTTON_VARIANT,
} from "./constants/button.constants";

import { useStyles } from "./Button.style";
import ButtonContent from "./ButtonContent";
import { mergeSx } from "../../utilities/sx.utility";
import { lazy, Suspense, type FC, type MouseEvent } from "react";
import type { IconNameType } from "../../constants/icon.constant";
import SmartbaseButton from "../../vendor/smartbase/components/Button/Button";
import { Box, CircularProgress, type SxProps, type Theme } from "@mui/material";

const LoadingAnimation = lazy(() => import("../LoadingAnimation/LoadingAnimation"));

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
  const buttonAriaLabel = isLoading ? (ariaLabel ?? text ?? "טוען...") : ariaLabel;

  return (
    <SmartbaseButton
      onClick={onClick}
      disabled={disabled}
      isLoading={isLoading}
      ariaLabel={buttonAriaLabel}
      variant={SMARTBASE_VARIANT_BY_BUTTON_VARIANT[variant]}
      sx={mergeSx(styles.button({ isLoading, variant, size, shape, hasIcon }), sx ?? null)}
    >
      {isLoading ? (
        <>
          <Box component="span" style={styles.text}>
            {text}
          </Box>
          <Box component="div" style={styles.loadingAnimation}>
            <Suspense fallback={<CircularProgress size={20} color="inherit" />}>
              <LoadingAnimation />
            </Suspense>
          </Box>
        </>
      ) : (
        <ButtonContent
          text={text}
          icon={icon}
          hasIconBadge={hasIconBadge}
          iconColor={ICON_COLOR_BY_VARIANT[variant]}
        />
      )}
    </SmartbaseButton>
  );
};

export default Button;
