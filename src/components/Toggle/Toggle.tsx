import { useStyles } from "./Toggle.style";
import { Box, ButtonBase } from "@mui/material";
import { type Dispatch, type FC, type SetStateAction, useEffect, useState } from "react";

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
  const styles = useStyles();
  const [internalState, setInternalState] = useState<boolean>(value);

  useEffect(() => {
    setInternalState(true);
  }, []);

  useEffect(() => {
    setValue(internalState);
  }, [internalState]);

  useEffect(() => {
    setInternalState(value);
  }, [value]);

  const onRightButtonClick = () => {
    setInternalState(true);
    handleFirstValueClick?.();
  };

  const onLeftButtonClick = () => {
    setInternalState(false);
    handleSecondValueClick?.();
  };

  return (
    <Box style={styles.root}>
      <Box sx={styles.slider(internalState)} />
      <ButtonBase
        onClick={onRightButtonClick}
        sx={styles.button(internalState)}
      >
        {firstValuePlaceHolder}
      </ButtonBase>
      <ButtonBase
        onClick={onLeftButtonClick}
        sx={styles.button(!internalState)}
      >
        {secondValuePlaceHolder}
      </ButtonBase>
    </Box>
  );
};

export default Toggle;
