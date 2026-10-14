import { createStyles } from "../../../../../create-styles";
import { theme } from "../../../../../constants/theme.constants";
import { MUTED_CAPTION } from "../../../../../styles/templates.style";

export const APARTMENT_COLUMN_STYLES = createStyles({
  cell: {
    gap: "4px",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    color: theme.palette.charcoal,
  },
  text: {
    fontSize: 14,
    fontWeight: 600,
  },
  mutedText: {
    ...MUTED_CAPTION,
    fontSize: 14,
  },
  caption: {
    ...MUTED_CAPTION,
    fontSize: 12,
  },
  selectCell: {
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
