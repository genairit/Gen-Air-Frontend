import { Children, type ReactNode } from "react";

export const hasRenderableChildren = (content: ReactNode): boolean =>
  Children.toArray(content).some(child => child !== "");
