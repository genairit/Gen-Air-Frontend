import { createStyles } from "../../create-styles";
import { MOBILE_LAYOUT_QUERY } from "../../constants/layout.constant";
import { JENNY_LAUNCHER_CLEARANCE_PX } from "../../constants/jenny.constant";

export const useProjectPageStyles = () =>
  createStyles({
    jennyClearance: {
      flexShrink: 0,
      display: "none",
      height: JENNY_LAUNCHER_CLEARANCE_PX,
      [`@media ${MOBILE_LAYOUT_QUERY}`]: { display: "block" },
    },
  });
