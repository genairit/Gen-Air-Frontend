import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";

const { palette, softShadow } = theme;

export const useStyles = () =>
  createStyles({
    option: (isSelected: boolean) => ({
      gap: "14px",
      minWidth: 0,
      display: "flex",
      cursor: "pointer",
      padding: "18px 20px",
      alignItems: "center",
      borderRadius: "22px",
      boxShadow: isSelected ? softShadow.insetSelected : softShadow.raisedLarge,
      backgroundColor: isSelected ? palette.airBlue : palette.iceWhite,
    }),
    optionText: {
      gap: "4px",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
    },
    optionTitle: {
      fontSize: 15,
      lineHeight: 1.35,
      fontWeight: 700,
    },
    optionSubtitle: {
      fontSize: 13,
      color: palette.textMuted,
    },
    notice: {
      fontSize: 14,
      fontWeight: 600,
      padding: "12px 18px",
      borderRadius: theme.radius.panel,
      backgroundColor: palette.airBlue,
    },
  });
