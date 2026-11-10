import type { FC } from "react";
import { useStyles } from "./Switch.style";
import { Box, ButtonBase } from "@mui/material";
import { SWITCH_THUMB_TRAVEL } from "../../constants/switch.constant";
import { useToggleGesture, type IToggleGesture } from "../../hooks/use-toggle-gesture.hook";

interface ISwitchProps {
  id?: string;
  checked: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string | null;
  gesture?: IToggleGesture | null;
  onChange: (checked: boolean) => void;
}

const Switch: FC<ISwitchProps> = ({
  id,
  checked,
  onChange,
  ariaLabel,
  ariaDescribedBy = null,
  gesture = null,
  disabled = false,
}) => {
  const styles = useStyles();
  const ownGesture = useToggleGesture({
    checked,
    onChange,
    disabled,
    travel: SWITCH_THUMB_TRAVEL,
  });

  const { progress, isPressed, isDragging } = gesture ?? ownGesture;

  const describedByProps = ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {};
  const isWrapperDriven = gesture !== null;
  const gestureProps = isWrapperDriven ? {} : ownGesture.gestureProps;
  const styleOptions = { checked, progress, isPressed, isDragging };

  return (
    <ButtonBase
      id={id}
      role="switch"
      disableRipple
      disabled={disabled}
      aria-label={ariaLabel}
      aria-checked={checked}
      sx={styles.track({ ...styleOptions, disabled })}
      {...describedByProps}
      {...gestureProps}
    >
      <Box sx={styles.thumb(styleOptions)} />
    </ButtonBase>
  );
};

export default Switch;
