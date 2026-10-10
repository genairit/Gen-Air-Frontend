import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { CENTERED_FLEX, ELLIPSIS_TEXT, MUTED_CAPTION } from "../../styles/templates.style";

const { palette, radius, font, softShadow } = theme;

const DRAGGING_OPACITY = 0.4;

const HIGHLIGHTED_STYLE = { backgroundColor: palette.airBlue, boxShadow: softShadow.insetSelected };

interface IStageCardStyleOptions {
  isDragging: boolean;
  isHighlighted: boolean;
}

export const useStyles = () =>
  createStyles({
    card: ({ isDragging, isHighlighted }: IStageCardStyleOptions) => ({
      flexDirection: "row",
      alignItems: "center",
      opacity: isDragging ? DRAGGING_OPACITY : 1,
      ...(isHighlighted ? HIGHLIGHTED_STYLE : {}),
    }),
    handle: {
      fontSize: 16,
      cursor: "grab",
      letterSpacing: "-2px",
      color: palette.disabledText,
    },
    position: {
      ...CENTERED_FLEX,
      width: 42,
      height: 42,
      fontSize: 13,
      flexShrink: 0,
      fontWeight: 500,
      fontFamily: font.mono,
      color: palette.iceWhite,
      borderRadius: radius.badge,
      backgroundColor: palette.charcoal,
    },
    details: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
    },
    name: {
      fontSize: 16,
      fontWeight: 700,
    },
    description: {
      ...MUTED_CAPTION,
      ...ELLIPSIS_TEXT,
    },
  });
