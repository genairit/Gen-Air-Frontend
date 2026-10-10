import type { IconNameType } from "../constants/icon.constant";

export interface INavigationItem {
  id: string;
  label: string;
  icon?: IconNameType;
}
