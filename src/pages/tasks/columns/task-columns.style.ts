import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";
import { MUTED_CAPTION } from "../../../styles/templates.style";

export const TASK_COLUMN_STYLES = createStyles({
  cell: {
    gap: "4px",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 15,
    overflowWrap: "anywhere",
    fontWeight: 700,
    color: theme.palette.charcoal,
  },
  caption: {
    ...MUTED_CAPTION,
    fontSize: 12,
  },
  linkCaption: {
    ...MUTED_CAPTION,
    gap: "6px",
    fontSize: 12,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
  },
  linkName: {
    fontWeight: 700,
    color: theme.palette.charcoal,
  },
  assignee: {
    gap: "8px",
    minWidth: 0,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
  },
  assigneeName: (isPool: boolean) => ({
    fontSize: 14,
    fontWeight: 600,
    color: isPool ? theme.palette.textMuted : theme.palette.charcoal,
  }),
  due: (isOverdue: boolean) => ({
    fontSize: 13,
    whiteSpace: "nowrap",
    fontWeight: isOverdue ? 800 : 500,
    color: isOverdue ? theme.palette.charcoal : theme.palette.textMuted,
  }),
  stopper: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
  },
  mobileRow: {
    gap: "10px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
