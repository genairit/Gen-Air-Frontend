import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX, MUTED_CAPTION } from "../../styles/templates.style";

const { palette, softShadow, radius } = theme;

export const useStyles = () =>
  createStyles({
    zone: ({ isDragging }: { isDragging: boolean }) => ({
      alignItems: "center",
      textAlign: "center",
      boxShadow: softShadow.insetLarge,
      backgroundColor: isDragging ? palette.airBlue : palette.iceWhite,
    }),
    plus: {
      ...CENTERED_FLEX,
      width: 72,
      height: 72,
      fontSize: 26,
      fontWeight: 300,
      color: palette.orange,
      borderRadius: radius.pill,
      boxShadow: softShadow.raisedLarge,
    },
    title: {
      fontSize: 17,
      fontWeight: 700,
    },
    description: {
      ...MUTED_CAPTION,
      maxWidth: 360,
      textWrap: "pretty",
    },
    input: {
      display: "none",
    },
  });
