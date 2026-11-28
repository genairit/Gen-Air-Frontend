import { useLayoutEffect, useRef } from "react";

export const useVisibleActiveTab = (selected: string) => {
  const viewport = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const strip = viewport.current;
    const tab = strip?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!strip || !tab) {
      return;
    }

    const reveal = () => {
      const bounds = strip.getBoundingClientRect();
      const item = tab.getBoundingClientRect();
      const leftOverflow = Math.min(0, item.left - bounds.left);
      const rightOverflow = Math.max(0, item.right - bounds.right);
      strip.scrollBy({ left: leftOverflow + rightOverflow });
    };
    reveal();
    const observer = new ResizeObserver(reveal);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [selected]);

  return viewport;
};
