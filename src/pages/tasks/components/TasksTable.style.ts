import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";
import { MOBILE_LAYOUT_QUERY } from "../../../constants/layout.constant";

export const useStyles = () =>
  createStyles({
    sort: {
      flex: "0 1 200px",
      minWidth: 0,
      "& .MuiSelect-select": { paddingBlock: "6px" },
      [`@media ${MOBILE_LAYOUT_QUERY}`]: { flexGrow: 1 },
    },
    filters: {
      minWidth: 0,
      [`@media ${MOBILE_LAYOUT_QUERY}`]: {
        "& [role='group']": {
          width: "100%",
          boxSizing: "border-box",
          borderRadius: theme.radius.panel,
          gap: "4px",
        },
        "& [data-tab-option]": { paddingInline: "10px" },
      },
    },
  });
