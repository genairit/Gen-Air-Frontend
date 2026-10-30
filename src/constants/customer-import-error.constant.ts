export const CUSTOMER_IMPORT_ERROR_CODES = {
  CUSTOMER_NOT_FOUND: "CUSTOMER_NOT_FOUND",
  CUSTOMER_CONTACT_NOT_FOUND: "CUSTOMER_CONTACT_NOT_FOUND",
  INVALID_CUSTOMER_CONTACT: "INVALID_CUSTOMER_CONTACT",
  DUPLICATE_CUSTOMER_CONTACT: "DUPLICATE_CUSTOMER_CONTACT",
  APARTMENT_IMPORT_FILE_REQUIRED: "APARTMENT_IMPORT_FILE_REQUIRED",
  APARTMENT_IMPORT_BUILDING_NOT_FOUND: "APARTMENT_IMPORT_BUILDING_NOT_FOUND",
  APARTMENT_IMPORT_BUILDING_INVALID: "APARTMENT_IMPORT_BUILDING_INVALID",
} as const;

export const CUSTOMER_IMPORT_ERROR_MESSAGES: Record<string, string> = {
  [CUSTOMER_IMPORT_ERROR_CODES.CUSTOMER_NOT_FOUND]: "הלקוח לא נמצא",
  [CUSTOMER_IMPORT_ERROR_CODES.CUSTOMER_CONTACT_NOT_FOUND]: "איש הקשר לא נמצא אצל הלקוח",
  [CUSTOMER_IMPORT_ERROR_CODES.INVALID_CUSTOMER_CONTACT]: "פרטי איש הקשר אינם תקינים",
  [CUSTOMER_IMPORT_ERROR_CODES.DUPLICATE_CUSTOMER_CONTACT]:
    "איש קשר עם פרטים אלה כבר קיים אצל הלקוח",
  [CUSTOMER_IMPORT_ERROR_CODES.APARTMENT_IMPORT_FILE_REQUIRED]: "יש לבחור קובץ אקסל לייבוא",
  [CUSTOMER_IMPORT_ERROR_CODES.APARTMENT_IMPORT_BUILDING_NOT_FOUND]: "הבניין שנבחר לא נמצא",
  [CUSTOMER_IMPORT_ERROR_CODES.APARTMENT_IMPORT_BUILDING_INVALID]:
    "לא ניתן לייבא דירות לפרויקט שנבחר",
};

export const CUSTOMER_IMPORT_STATUS_MESSAGES: Record<number, string> = {
  400: "הנתונים שנשלחו אינם תקינים",
  401: "פג תוקף החיבור. יש להתחבר מחדש",
  403: "אין לך הרשאה לבצע פעולה זו",
  404: "הפריט המבוקש לא נמצא",
  409: "הפעולה מתנגשת בנתונים קיימים",
};

export const CUSTOMER_IMPORT_ERROR_COPY = {
  GENERIC: "הפעולה נכשלה. נסה שוב בעוד רגע.",
  TEMPLATE: "מבנה הקובץ אינו תואם. יש להשתמש בתבנית הרשמית ללא שינוי שמות העמודות.",
} as const;
