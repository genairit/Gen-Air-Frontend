import { lazy, Suspense, type FC } from "react";
import { useStyles } from "./LoadingState.style";
import { Box, CircularProgress } from "@mui/material";

interface ILoadingStateProps {
  label?: string;
}

const LoadingAnimation = lazy(() => import("../LoadingAnimation/LoadingAnimation"));

const LoadingState: FC<ILoadingStateProps> = ({ label = "טוען..." }) => {
  const styles = useStyles();

  return (
    <Box role="status" sx={styles.container}>
      <Box aria-hidden sx={styles.animation}>
        <Suspense fallback={<CircularProgress size={32} sx={styles.spinner} />}>
          <LoadingAnimation />
        </Suspense>
      </Box>
      <Box component="span" sx={styles.label}>
        {label}
      </Box>
    </Box>
  );
};

export default LoadingState;
