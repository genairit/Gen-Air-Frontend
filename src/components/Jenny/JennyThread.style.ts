import { keyframes } from "@mui/material";
import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { ELLIPSIS_TEXT } from "../../styles/templates.style";
import { REDUCED_MOTION_QUERY } from "../../constants/layout.constant";
import { JENNY_ROLES, type JennyRoleType } from "../../constants/jenny.constant";

const { palette, glass, radius, font } = theme;

const TYPING_PULSE = keyframes`
  0%, 80%, 100% { opacity: 0.25; }
  40% { opacity: 1; }
`;

const BUBBLE_BASE = {
  maxWidth: "88%",
  fontSize: 15,
  lineHeight: 1.5,
  textAlign: "start",
  padding: "10px 14px",
  fontFamily: font.body,
  overflowWrap: "anywhere",
  color: palette.charcoal,
  borderRadius: "16px",
} as const;

const BUBBLE_BY_ROLE = {
  [JENNY_ROLES.USER]: {
    alignSelf: "flex-end",
    borderEndEndRadius: "6px",
    backgroundColor: palette.airBlue,
  },
  [JENNY_ROLES.ASSISTANT]: {
    alignSelf: "flex-start",
    boxShadow: glass.edge,
    borderEndStartRadius: "6px",
    backgroundColor: palette.white,
  },
} as const satisfies Record<JennyRoleType, object>;

export const useThreadStyles = () =>
  createStyles({
    thread: {
      flex: 1,
      gap: "12px",
      minHeight: 0,
      padding: "16px",
      display: "flex",
      overflowY: "auto",
      flexDirection: "column",
      overscrollBehavior: "contain",
      backgroundColor: palette.iceWhite,
      "&:focus-visible": { outline: `2px solid ${palette.primary}`, outlineOffset: "-2px" },
    },
    empty: {
      flex: 1,
      gap: "12px",
      display: "flex",
      padding: "0 8px",
      textAlign: "center",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center",
    },
    greeting: {
      margin: 0,
      fontSize: 15,
      fontWeight: 600,
      color: palette.charcoal,
    },
    disclaimer: {
      margin: 0,
      fontSize: 12,
      color: palette.textMuted,
    },
    bubble: (role: JennyRoleType) => ({ ...BUBBLE_BASE, ...BUBBLE_BY_ROLE[role] }),
    plainText: {
      margin: 0,
      whiteSpace: "pre-wrap",
    },
    markdown: {
      gap: "8px",
      display: "flex",
      flexDirection: "column",
      "& p, & ul, & ol": { margin: 0 },
      "& ul, & ol": {
        gap: "4px",
        display: "flex",
        flexDirection: "column",
        paddingInlineStart: "20px",
      },
      "& strong": { fontWeight: 700 },
    },
    markdownLine: {
      display: "block",
    },
    sources: {
      gap: "6px",
      display: "flex",
      marginTop: "10px",
      paddingTop: "10px",
      flexDirection: "column",
      borderTop: `1px solid ${glass.border}`,
    },
    sourcesLabel: {
      margin: 0,
      fontSize: 12,
      fontWeight: 600,
      color: palette.textMuted,
    },
    sourceList: {
      gap: "6px",
      margin: 0,
      padding: 0,
      display: "flex",
      listStyle: "none",
      flexDirection: "column",
    },
    sourceRow: {
      gap: "8px",
      minWidth: 0,
      minHeight: 36,
      display: "flex",
      padding: "0 12px",
      alignItems: "center",
      textDecoration: "none",
      color: palette.charcoal,
      borderRadius: radius.pill,
      border: `1px solid ${glass.border}`,
      backgroundColor: palette.white,
    },
    sourceLink: {
      "&:hover .jenny-source-name": { textDecoration: "underline" },
      "&:focus-visible": { outline: `2px solid ${palette.primary}`, outlineOffset: "2px" },
    },
    sourceName: {
      ...ELLIPSIS_TEXT,
      flex: 1,
      minWidth: 0,
      fontSize: 13,
      fontWeight: 600,
    },
    sourcePage: {
      fontSize: 12,
      flexShrink: 0,
      color: palette.textMuted,
    },
    typing: {
      gap: "8px",
      fontSize: 13,
      display: "flex",
      alignItems: "center",
      color: palette.textMuted,
    },
    typingDots: {
      gap: "4px",
      display: "flex",
    },
    typingDot: (delayMs: number) => ({
      width: 6,
      height: 6,
      borderRadius: radius.pill,
      backgroundColor: palette.primary,
      animation: `${TYPING_PULSE} 1.2s ease-in-out ${delayMs}ms infinite`,
      [`@media ${REDUCED_MOTION_QUERY}`]: { animation: "none", opacity: 0.6 },
    }),
    error: {
      gap: "8px",
      maxWidth: "88%",
      display: "flex",
      alignSelf: "flex-start",
      flexDirection: "column",
      alignItems: "flex-start",
    },
  });
