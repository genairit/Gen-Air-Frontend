import type { AriaAttributes } from "react";

interface IControlledElement {
  id: string;
  isRendered: boolean;
}

export const getControlledElementId = ({ id, isRendered }: IControlledElement): string | null => {
  if (!isRendered) {
    return null;
  }

  return id;
};

export const getAriaControlsAttributes = (
  ariaControls: string | null,
): Pick<AriaAttributes, "aria-controls"> => {
  if (ariaControls === null) {
    return {};
  }

  return { "aria-controls": ariaControls };
};
