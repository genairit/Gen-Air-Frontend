import { useEffect, useState } from "react";

interface IUseScrollReachedOptions {
  isEnabled: boolean;
  rootMargin?: string;
  onReach: () => void;
  root?: Element | null;
}

const isReached = (entry: IntersectionObserverEntry) => {
  const isScrolledPast = entry.boundingClientRect.bottom < (entry.rootBounds?.top ?? 0);

  return entry.isIntersecting || isScrolledPast;
};

export const useScrollReached = ({
  onReach,
  isEnabled,
  root = null,
  rootMargin = "0px",
}: IUseScrollReachedOptions) => {
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!element || !isEnabled) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(isReached)) {
          onReach();
        }
      },
      { root, rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [element, isEnabled, onReach, rootMargin, root]);

  return setElement;
};
