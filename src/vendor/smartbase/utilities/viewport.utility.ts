export const getVisualViewport = (): VisualViewport | null => globalThis.visualViewport ?? null;

export const getKeyboardInset = (
  visualViewport: Pick<VisualViewport, "height" | "offsetTop">,
  windowHeight: number,
): number => Math.max(0, windowHeight - visualViewport.height - visualViewport.offsetTop);
