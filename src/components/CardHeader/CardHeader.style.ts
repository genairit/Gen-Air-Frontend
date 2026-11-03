import { createStyles } from "../../create-styles";
import { MOBILE_LAYOUT_QUERY } from "../../constants/layout.constant";

export const useStyles = () =>
  createStyles({
    container: {
      gap: "10px",
      display: "flex",
      alignItems: "flex-start",
    },
    content: {
      flex: 1,
      minWidth: 0,
    },
    headerLayout: ({ stackActionsOnMobile }: { stackActionsOnMobile: boolean }) => ({
      gap: "10px",
      display: "flex",
      alignItems: "flex-start",
      ...(stackActionsOnMobile && {
        [`@media ${MOBILE_LAYOUT_QUERY}`]: { flexDirection: "column" },
      }),
    }),
    titles: { flex: 1, minWidth: 0 },
    action: {
      minWidth: 0,
      maxWidth: "100%",
      [`@media ${MOBILE_LAYOUT_QUERY}`]: { width: "100%" },
    },
  });
