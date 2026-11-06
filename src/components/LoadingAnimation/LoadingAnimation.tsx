import { Lottie } from "lottie-react";
import { useMediaQuery } from "@mui/material";
import loadingAnimation from "../../lottie/Smartbase-Loading.json";

const LoadingAnimation = () => {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  return <Lottie loop={!reducedMotion} src={loadingAnimation} autoplay={!reducedMotion} />;
};

export default LoadingAnimation;
