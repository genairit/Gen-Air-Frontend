export const APARTMENT_IMPORT = {
  MAX_FILE_BYTES: 5 * 1024 * 1024,
  EXTENSION: ".xlsx",
  MIME_TYPE: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  INVALID_TEMPLATE_STATUS: 422,
  INVALID_TEMPLATE: "INVALID_TEMPLATE",
  TITLE: "ייבוא דירות מקובץ אקסל",
  STEPS: ["העלאה", "תוצאות"],
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

export const IMPORT_DESIGN = {
  SUCCESS: { surface: "#E1EDFA", foreground: "#0F4F96", marker: "#1F7FDB" },
  PARTIAL: { surface: "#FFF6E0", foreground: "#5C3D00", marker: "#C98A00" },
  ERROR: { surface: "#FBE3E3", foreground: "#7A1710" },
  STATUS: {
    [IMPORT_ROW_STATUS.CREATED]: { surface: "#E1EDFA", foreground: "#1668BD" },
    [IMPORT_ROW_STATUS.EXISTING]: { surface: "transparent", foreground: "#6E7178" },
    [IMPORT_ROW_STATUS.DUPLICATE]: { surface: "#FFF8E6", foreground: "#8A5A00" },
    [IMPORT_ROW_STATUS.ERROR]: { surface: "#FDF0EF", foreground: "#B3261E" },
  },
} as const;
