import { Slide, type SlideProps } from "@mui/material";

const SlideUpTransition = (props: Omit<SlideProps, "direction">) => (
  <Slide {...props} direction="up" />
);

export default SlideUpTransition;
