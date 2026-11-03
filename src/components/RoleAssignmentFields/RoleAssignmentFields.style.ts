import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { TIME_UNITS } from "../../constants/time.constant";

interface IRoleOptionStyleOptions {
  isSelected: boolean;
}

const ROLE_OPTION_TRANSITION_MS = TIME_UNITS.SECOND_MS * 0.16;

const getOptionStyle = ({ isSelected }: IRoleOptionStyleOptions) => ({
  gap: "4px",
  minWidth: 0,
  minHeight: 104,
  display: "flex",
  padding: "4px 12px",
  boxSizing: "border-box",
  flexDirection: "column",
  justifyContent: "space-between",
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
    visuallyHidden: {
      width: 1,
      height: 1,
      overflow: "hidden",
      position: "absolute",
      whiteSpace: "nowrap",
      clipPath: "inset(50%)",
    },
    roleGrid: ({ columns }: { columns: 2 | 3 }) => ({
      gap: "8px",
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      "@media (max-width: 639px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
    }),
    roleOption: ({ isSelected }: IRoleOptionStyleOptions) => ({
      ...getOptionStyle({ isSelected }),
      "& .MuiFormControlLabel-root": {
        margin: 0,
        width: "100%",
        minHeight: 48,
        padding: 0,
      },
      "& .MuiFormControlLabel-label": {
        fontSize: 15,
        fontWeight: 500,
        whiteSpace: "normal",
        overflowWrap: "anywhere",
      },
    }),
    activeBadge: {
      fontSize: 12,
      fontWeight: 700,
      width: "fit-content",
      color: theme.palette.primary,
      padding: "4px 10px",
      marginBlockEnd: "8px",
      borderRadius: theme.radius.pill,
      border: `1px solid ${theme.palette.airBlueOutline}`,
      backgroundColor: theme.palette.white,
    },
  });
