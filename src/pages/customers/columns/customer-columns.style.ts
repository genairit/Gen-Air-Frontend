import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";
import { MUTED_CAPTION, MONOSPACE_CAPTION } from "../../../styles/templates.style";

export const CUSTOMER_COLUMN_STYLES = createStyles({
  cell: {
    gap: "4px",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  name: {
    fontSize: 15,
    fontWeight: 700,
    color: theme.palette.charcoal,
  },
  contactName: {
    fontSize: 14,
    fontWeight: 600,
  },
  caption: {
    ...MUTED_CAPTION,
    fontSize: 12,
  },
  priorityId: MONOSPACE_CAPTION,
  syncRow: {
    gap: "10px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
  },
});
