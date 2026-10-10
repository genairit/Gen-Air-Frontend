import type { FC } from "react";
import { useStyles } from "./LoadingState.style";
import { Box, CircularProgress } from "@mui/material";

interface ILoadingStateProps {
  label?: string;
}

const LoadingState: FC<ILoadingStateProps> = ({ label = "טוען..." }) => {
  const styles = useStyles();

  return (
    <Box role="status" sx={styles.container}>
      <CircularProgress size={32} sx={styles.spinner} />
      <Box component="span" sx={styles.label}>
        {label}
      </Box>
    </Box>
  );
};

export default LoadingState;
