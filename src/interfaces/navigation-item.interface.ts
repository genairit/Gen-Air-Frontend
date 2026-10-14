import type { Params } from "react-router-dom";
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

export interface IBackLinkRoute {
  label: string;
  buildPath: (params: Params) => string;
}
