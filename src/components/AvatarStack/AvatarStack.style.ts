import { createStyles } from "../../create-styles";

const OVERLAP = 8;

export const useStyles = () =>
  createStyles({
    stack: {
      display: "flex",
    },
    slot: ({ avatarSize, isLast }: { avatarSize: number; isLast: boolean }) => ({
      flexShrink: 0,
      overflow: "visible",
      width: isLast ? avatarSize : avatarSize - OVERLAP,
    }),
  });
