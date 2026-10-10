import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette, softShadow, radius } = theme;

const HIGHLIGHTED_STYLE = { backgroundColor: palette.airBlue, boxShadow: softShadow.insetSelected };

export const useStyles = () =>
  createStyles({
    column: ({ isHighlighted }: { isHighlighted: boolean }) => ({
      minHeight: 200,
      ...(isHighlighted ? HIGHLIGHTED_STYLE : {}),
    }),
    header: {
      display: "flex",
      padding: "6px 8px 0",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      gap: "10px",
      fontSize: 16,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
    },
    empty: {
      fontSize: 13,
      padding: "24px",
      textAlign: "center",
      color: palette.textMuted,
      borderRadius: radius.panel,
      border: `2px dashed ${palette.outline}`,
    },
  });
