import {
  PAGE_STACK_GAP_PX,
  MOBILE_LAYOUT_QUERY,
  MAIN_BOTTOM_PADDING_PX,
  FLOATING_CONTROL_CLEARANCE_PX,
} from "../../constants/layout.constant";

import { createStyles } from "../../create-styles";
import { JENNY_LAUNCHER_SIZE_PX, JENNY_LAUNCHER_BOTTOM_PX } from "../../constants/jenny.constant";

interface IClearanceGeometry {
  launcherBottom: number;
  mainBottomPadding: number;
}

const getJennyClearanceHeight = ({ launcherBottom, mainBottomPadding }: IClearanceGeometry) => {
  const launcherTop = launcherBottom + JENNY_LAUNCHER_SIZE_PX;
  const contentBottom = launcherTop + FLOATING_CONTROL_CLEARANCE_PX;

  return contentBottom - mainBottomPadding - PAGE_STACK_GAP_PX;
};

export const useProjectPageStyles = () =>
  createStyles({
    jennyClearance: {
      flexShrink: 0,
      height: getJennyClearanceHeight({
        launcherBottom: JENNY_LAUNCHER_BOTTOM_PX.DESKTOP,
        mainBottomPadding: MAIN_BOTTOM_PADDING_PX.DESKTOP,
      }),
      [`@media ${MOBILE_LAYOUT_QUERY}`]: {
        height: getJennyClearanceHeight({
          launcherBottom: JENNY_LAUNCHER_BOTTOM_PX.MOBILE,
          mainBottomPadding: MAIN_BOTTOM_PADDING_PX.MOBILE,
        }),
      },
    },
  });
