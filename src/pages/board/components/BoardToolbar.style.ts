import { createStyles } from "../../../create-styles";

export const useStyles = () =>
  createStyles({
    card: {
      "&:focus-within": { zIndex: 3 },
      "&:has([role='combobox'][aria-expanded='true'])": { zIndex: 3 },
    },
  });
