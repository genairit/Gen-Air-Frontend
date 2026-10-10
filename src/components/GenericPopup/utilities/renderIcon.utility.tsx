import {
  type TPopUpIcons,
  GENERIC_POPUP_ICONS,
} from "../constants/icons.constants";

import { isValidElement, type ReactNode } from "react";

export const renderPopupIcon = (icon?: TPopUpIcons | ReactNode): ReactNode => {
  if (!icon) {
    return null;
  }

  if (typeof icon === "string" && icon in GENERIC_POPUP_ICONS) {
    const IconComponent = GENERIC_POPUP_ICONS[icon as TPopUpIcons];
    return <IconComponent />;
  }

  if (isValidElement(icon)) {
    return icon;
  }

  return null;
};
