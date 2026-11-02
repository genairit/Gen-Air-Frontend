import { TAB_NAVIGATION_KEYS, type TabNavigationKeyType } from "../../../constants/tabs.constant";

export const isTabNavigationKey = (key: string): key is TabNavigationKeyType =>
  Object.values(TAB_NAVIGATION_KEYS).some(navigationKey => navigationKey === key);
