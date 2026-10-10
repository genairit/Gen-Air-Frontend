import type { ReactNode } from "react";
import { useStyles } from "./CharCounter.style";
import { InputAdornment, Typography } from "@mui/material";

interface ICharCounterAdornment {
  input: string;
  maxLength?: number;
}

const CharCounterAdornment = ({ input, maxLength }: ICharCounterAdornment): ReactNode => {
  const styles = useStyles();

  if (!maxLength) {
    return null;
  }

  return (
    <InputAdornment position="start">
      <Typography sx={styles.charCounter}>
        {input?.length || 0}/{maxLength}
      </Typography>
    </InputAdornment>
  );
};

export default CharCounterAdornment;
