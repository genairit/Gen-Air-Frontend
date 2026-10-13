import type { IconNameType } from "../constants/icon.constant";

export interface INavigationItem {
  id: string;
  label: string;
  icon?: IconNameType;
}

export interface IBackLinkTarget {
  to: string;
  label: string;
}
