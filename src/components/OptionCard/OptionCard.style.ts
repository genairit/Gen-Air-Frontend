import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette, glass } = theme;

const SELECTED_STYLE = {
  backgroundColor: palette.airBlue,
  border: `1px solid ${palette.primary}`,
  boxShadow: glass.focus,
};

const IDLE_STYLE = {
  backgroundColor: glass.strong,
  border: `1px solid ${glass.border}`,
  boxShadow: glass.shadowSmall,
};

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
