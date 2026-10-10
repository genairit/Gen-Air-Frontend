import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette, softShadow } = theme;

const SELECTED_STYLE = { backgroundColor: palette.airBlue, boxShadow: softShadow.insetSelected };

const IDLE_STYLE = { backgroundColor: palette.iceWhite, boxShadow: softShadow.raisedLarge };

export const useStyles = () =>
  createStyles({
    card: ({ isSelected }: { isSelected: boolean }) => (isSelected ? SELECTED_STYLE : IDLE_STYLE),
    indicatorRow: {
      gap: "12px",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    title: {
      fontSize: 18,
      fontWeight: 700,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: 600,
      color: palette.textMuted,
    },
    description: {
      flex: 1,
      fontSize: 13,
      lineHeight: 1.5,
      textWrap: "pretty",
      color: palette.textBody,
    },
    tag: {
      alignSelf: "flex-start",
    },
  });
