import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { TIME_UNITS } from "../../constants/time.constant";

interface IRoleOptionStyleOptions {
  isSelected: boolean;
}

const ROLE_OPTION_TRANSITION_MS = TIME_UNITS.SECOND_MS * 0.16;

const getOptionStyle = ({ isSelected }: IRoleOptionStyleOptions) => ({
  minWidth: 0,
  minHeight: 48,
  display: "flex",
  alignItems: "center",
  borderRadius: theme.radius.badge,
  border: `1px solid ${isSelected ? theme.palette.airBlueOutline : theme.glass.border}`,
  backgroundColor: isSelected ? theme.palette.airBlue : theme.palette.iceWhite,
  transition: `background-color ${ROLE_OPTION_TRANSITION_MS}ms ease, border-color ${ROLE_OPTION_TRANSITION_MS}ms ease`,
  "&:focus-within": { outline: `2px solid ${theme.palette.primary}`, outlineOffset: 2 },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

export const useStyles = () =>
  createStyles({
    container: {
      gap: "12px",
      display: "flex",
      flexDirection: "column",
    },
    roleGrid: {
      gap: "8px",
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      "@media (max-width: 639px)": { gridTemplateColumns: "minmax(0, 1fr)" },
    },
    roleOption: ({ isSelected }: IRoleOptionStyleOptions) => ({
      ...getOptionStyle({ isSelected }),
      "& .MuiFormControlLabel-root": {
        margin: 0,
        width: "100%",
        minHeight: 48,
        padding: "8px 12px",
      },
      "& .MuiFormControlLabel-label": { fontSize: 15, fontWeight: 500 },
    }),
    activeSection: {
      gap: "10px",
      display: "flex",
      paddingBlockStart: "16px",
      flexDirection: "column",
      borderBlockStart: `1px solid ${theme.glass.border}`,
    },
    activeGrid: {
      gap: "8px",
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      "@media (max-width: 639px)": { gridTemplateColumns: "minmax(0, 1fr)" },
    },
    activeOption: ({ isSelected }: IRoleOptionStyleOptions) => ({
      ...getOptionStyle({ isSelected }),
      "& > label": { width: "100%", paddingInline: "12px" },
    }),
    activeSummary: {
      fontSize: 15,
      fontWeight: 600,
      width: "fit-content",
      color: theme.palette.primary,
      padding: "10px 14px",
      borderRadius: theme.radius.badge,
      border: `1px solid ${theme.palette.airBlueOutline}`,
      backgroundColor: theme.palette.airBlue,
    },
  });
