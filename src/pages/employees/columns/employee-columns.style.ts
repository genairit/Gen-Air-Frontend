import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";

export const EMPLOYEE_COLUMN_STYLES = createStyles({
  email: {
    fontSize: 14,
    display: "block",
    textAlign: "end",
  },
  phone: {
    gap: "8px",
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    justifySelf: "start",
    color: theme.palette.charcoal,
  },
  actions: {
    gap: "10px",
    display: "flex",
  },
});
