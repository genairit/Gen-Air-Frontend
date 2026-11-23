export const CLONE_RECOVERY_BY_STATUS: Record<number, string[]> = {
  401: ["התחבר מחדש ובדוק את תוצאת הבקשה לפני יצירה נוספת."],
  403: ["בדוק את הרשאותיך עם מנהל המערכת, או חזור להצעת המקור."],
  404: ["חזור לרשימת ההצעות ובדוק שהצעת המקור עדיין זמינה."],
};

export const CLONE_ERROR_CODES = {
  MAPPING_FAILED: "QUOTATION_CLONE_MAPPING_FAILED",
  SOURCE_CHANGED: "QUOTATION_CLONE_SOURCE_CHANGED",
  COMMAND_CONFLICT: "QUOTATION_CLONE_COMMAND_CONFLICT",
} as const;

export const CLONE_COMMAND_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const CLONE_DIAGNOSTIC_CLASSIFICATIONS = {
  HTTP_OR_TRANSPORT: "http-or-transport",
  PLATFORM_OR_CLIENT: "platform-or-client",
} as const;

export type CloneDiagnosticClassificationType =
  (typeof CLONE_DIAGNOSTIC_CLASSIFICATIONS)[keyof typeof CLONE_DIAGNOSTIC_CLASSIFICATIONS];

export const CLONE_DIAGNOSTIC_CAUSES = {
  INVALID_JSON: "invalid-json",
  REQUEST_OR_STORAGE_FAILURE: "request-or-storage-failure",
} as const;

export type CloneDiagnosticCauseType =
  (typeof CLONE_DIAGNOSTIC_CAUSES)[keyof typeof CLONE_DIAGNOSTIC_CAUSES];
