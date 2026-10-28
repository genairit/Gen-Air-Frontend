import { APARTMENT_IMPORT } from "../constants/apartment-import.constant.ts";
import type { ImportCountsType } from "../interfaces/apartment-import.interface.ts";

export const validateApartmentImportSelection = (files: readonly File[]): string | null => {
  if (files.length !== 1) {
    return "יש לבחור קובץ אקסל אחד בלבד";
  }

  const file = files[0];
  const hasValidExtension = file.name.toLowerCase().endsWith(APARTMENT_IMPORT.EXTENSION);
  const hasValidMimeType = file.type === "" || file.type === APARTMENT_IMPORT.MIME_TYPE;
  if (!hasValidExtension || !hasValidMimeType) {
    return "סוג קובץ לא נתמך. יש להעלות קובץ xlsx בלבד. לא הועלה דבר.";
  }

  const isEmpty = file.size === 0;
  const isTooLarge = file.size > APARTMENT_IMPORT.MAX_FILE_BYTES;
  if (isEmpty || isTooLarge) {
    return "יש לבחור קובץ שאינו ריק, עד 5 MB. לא הועלה דבר.";
  }

  return null;
};

export const getApartmentImportSummary = (counts: ImportCountsType): string => {
  const created = counts.created;
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  if (total === 0) {
    return "לא נמצאו שורות לייבוא";
  }

  if (created === total) {
    return `הייבוא הושלם בהצלחה — ${created} מתוך ${total} שורות נקלטו`;
  }

  return `${created} מתוך ${total} שורות נקלטו`;
};
