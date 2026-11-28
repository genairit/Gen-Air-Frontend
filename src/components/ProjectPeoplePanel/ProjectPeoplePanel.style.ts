import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

export const PEOPLE_ROW_STYLES = {
  minWidth: 0,
  paddingBlock: "3px",
  borderBottom: `1px solid ${theme.glass.border}`,
  "&:last-child": { borderBottom: 0 },
};

export const PEOPLE_ROLE_STYLES = {
  fontSize: 12,
  fontWeight: 700,
  color: theme.palette.primary,
  backgroundColor: theme.palette.surfaceHover,
  borderRadius: "6px",
  padding: "3px 7px",
};

export const usePeopleStyles = () =>
  createStyles({
    root: { display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 },
    columns: { display: "grid", gap: "20px", alignItems: "start" },
    column: {
      minWidth: 0,
      "&[hidden]": { display: "none" },
      "& > section, & > section > section": {
        boxShadow: "none",
        border: 0,
        borderRadius: 0,
        backgroundColor: "transparent",
        padding: "4px",
      },
      "& a": {
        color: theme.palette.primary,
        textDecoration: "none",
        fontSize: 13,
        overflowWrap: "anywhere",
      },
      "& a:hover": { textDecoration: "underline" },
      "& a:focus-visible": { outline: `2px solid ${theme.palette.primary}`, outlineOffset: 2 },
      "& button": { boxShadow: "none" },
    },
    identity: { display: "flex", alignItems: "center", gap: "10px", minWidth: 0 },
    avatar: {
      display: "grid",
      placeItems: "center",
      width: 34,
      height: 34,
      flexShrink: 0,
      borderRadius: "10px",
      fontWeight: 700,
      fontSize: 13,
      color: theme.palette.primary,
      backgroundColor: theme.palette.airBlue,
    },
    name: { fontSize: 15, fontWeight: 700, overflowWrap: "anywhere" },
  });
