import { ACTIVE_TAB_SELECTOR } from "../constants/tabs.constant";

export const focusAddedInput = (input: HTMLInputElement): void => {
  input.focus({ preventScroll: true });
  input.select();

  const bounds = input.getBoundingClientRect();
  const isOutsideViewport =
    bounds.top < 0 ||
    bounds.bottom > window.innerHeight ||
    bounds.left < 0 ||
    bounds.right > window.innerWidth;

  if (isOutsideViewport) {
    input.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
};

export const focusActiveTab = (tabList: HTMLElement | null): void => {
  tabList?.querySelector<HTMLElement>(ACTIVE_TAB_SELECTOR)?.focus();
};
