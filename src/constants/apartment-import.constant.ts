export const APARTMENT_IMPORT = {
  MAX_FILE_BYTES: 5 * 1024 * 1024,
  EXTENSION: ".xlsx",
  MIME_TYPE: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  INVALID_TEMPLATE_STATUS: 422,
  INVALID_TEMPLATE: "INVALID_TEMPLATE",
  STEPS: ["בחירת קובץ", "תוצאות הייבוא"],
} as const;

export const IMPORT_STAGE = {
  SELECT: "select",
  PROCESSING: "processing",
  RESULTS: "results",
} as const;

export const IMPORT_ROW_STATUS = {
  CREATED: "created",
  EXISTING: "existing",
  DUPLICATE: "duplicate",
  ERROR: "error",
} as const;

export const IMPORT_STATUS_LABELS = {
  [IMPORT_ROW_STATUS.CREATED]: "נוצרו",
  [IMPORT_ROW_STATUS.EXISTING]: "כבר קיימות — דולגו",
  [IMPORT_ROW_STATUS.DUPLICATE]: "כפולות בקובץ — דולגו",
  [IMPORT_ROW_STATUS.ERROR]: "שגיאות — דולגו",
} as const;

export const IMPORT_DOWNLOAD = {
  TEMPLATE: "apartments-template.xlsx",
  REPORT: "apartments-errors.xlsx",
} as const;
