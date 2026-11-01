import { logger } from "../utilities/logger.utility.ts";

export const performApartmentImportAction = async (
  action: () => Promise<void>,
): Promise<string | null> => {
  try {
    await action();
    return null;
  } catch {
    logger.error("Apartment import UI action failed", {});
    return "הפעולה נכשלה. ניתן לנסות שוב; תוצאות הייבוא נשמרות בחלון.";
  }
};
