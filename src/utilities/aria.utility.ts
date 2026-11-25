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

export const getAriaControlsAttributes = (ariaControls: string | null) => {
  if (ariaControls === null) {
    return {};
  }

  return { "aria-controls": ariaControls };
};
