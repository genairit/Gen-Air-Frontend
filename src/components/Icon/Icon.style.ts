import { createStyles } from "../../create-styles";

export const useStyles = () =>
  createStyles({
    image: (size: number) => ({
      width: size,
      height: size,
      flexShrink: 0,
      objectFit: "contain",
      display: "block",
    }),
    icon: ({ size, color }: { size: number; color: string }) => ({
      color,
      flexShrink: 0,
      fontSize: size,
    }),
  });
