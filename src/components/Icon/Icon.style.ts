import { createStyles } from "../../create-styles";

export const useStyles = () =>
  createStyles({
    icon: ({ size, color }: { size: number; color: string }) => ({
      color,
      flexShrink: 0,
      fontSize: size,
    }),
  });
