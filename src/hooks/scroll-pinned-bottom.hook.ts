import { useMediaQuery } from "@mui/material";
import { useRef, useLayoutEffect } from "react";
import { REDUCED_MOTION_QUERY } from "../constants/layout.constant";

interface IScrollPinnedToBottomOptions {
  threshold: number;
  contentVersion: string;
}

const getDistanceFromBottom = (element: HTMLElement) =>
  element.scrollHeight - element.scrollTop - element.clientHeight;

export const useScrollPinnedToBottom = <TElement extends HTMLElement>({
  threshold,
  contentVersion,
}: IScrollPinnedToBottomOptions) => {
  const containerRef = useRef<TElement | null>(null);
  const isPinnedRef = useRef(true);
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  const trackPinnedState = () => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    isPinnedRef.current = getDistanceFromBottom(container) <= threshold;
  };

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container || !isPinnedRef.current) {
      return;
    }

    const behavior = prefersReducedMotion ? "auto" : "smooth";
    container.scrollTo({ top: container.scrollHeight, behavior });
  }, [contentVersion, prefersReducedMotion]);

  return { containerRef, trackPinnedState };
};
