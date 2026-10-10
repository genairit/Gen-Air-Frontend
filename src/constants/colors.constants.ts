import { theme } from "./theme.constants";

export const SeverityLevels = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
} as const;

export type SeverityLevels = (typeof SeverityLevels)[keyof typeof SeverityLevels];

export const SEVERITY_LEVEL_COLORS = {
  [SeverityLevels.INFO]: theme.severity.info,
  [SeverityLevels.WARNING]: theme.severity.warning,
  [SeverityLevels.ERROR]: theme.severity.error,
};