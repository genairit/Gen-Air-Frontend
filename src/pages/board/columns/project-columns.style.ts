import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";
import { MUTED_CAPTION, MONOSPACE_CAPTION } from "../../../styles/templates.style";

export const PROJECT_COLUMN_STYLES = createStyles({
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
  code: MONOSPACE_CAPTION,
  text: {
    fontSize: 14,
    fontWeight: 600,
  },
  caption: {
    ...MUTED_CAPTION,
    fontSize: 12,
  },
  stopper: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
  },
});
