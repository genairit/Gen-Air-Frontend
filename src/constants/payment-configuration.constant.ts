import Decimal from "decimal.js";
import { PAYMENT_TERMS, PAYMENT_TERMS_VALUES } from "./payment-terms.constant";

export const PAYMENT_DECIMAL = Decimal.clone({ precision: 50, rounding: Decimal.ROUND_HALF_UP });
export const PAYMENT_STAGE_LIMITS = { COUNT: 30, TEXT: 300, PERCENT_DECIMALS: 4 } as const;
export const PAYMENT_PERCENT_PATTERN = new RegExp(
  `^\\d+(?:\\.\\d{1,${PAYMENT_STAGE_LIMITS.PERCENT_DECIMALS}})?$`,
);
export const CUSTOMER_PAYMENT_TERMS_VALUES = PAYMENT_TERMS_VALUES.filter(
  value => value !== PAYMENT_TERMS.OTHER,
);
export const PAYMENT_CONFIGURATION_COPY = {
  LABEL: "תנאי תשלום",
  TOTAL: "סה״כ",
  PERCENT_ERROR: `יש להזין אחוז בין 0 ל־100, עד ${PAYMENT_STAGE_LIMITS.PERCENT_DECIMALS} ספרות אחרי הנקודה.`,
  TEXT_ERROR: `יש לתאר את מועד התשלום בטקסט של עד ${PAYMENT_STAGE_LIMITS.TEXT} תווים.`,
  NONE: "ללא ברירת מחדל",
  CUSTOM: "מותאם אישית",
  PERCENT: "אחוז מהסכום",
  MILESTONE: "מועד / אבן דרך",
  ADD: "+ שלב תשלום",
  ADD_LABEL: "הוסף שלב תשלום",
  REMOVE: "הסר שלב",
  CANCEL: "ביטול",
  CONFIRM: "מחק שלבים ובחר תנאים",
  CONFIRM_CLEAR: "מחק שלבים ונקה תנאים",
  CONFIRM_MESSAGE: "הבחירה תמחק את שלבי התשלום שהוזנו.",
  CONFLICT: "יש לבחור בין תנאי תשלום קבועים לשלבי תשלום.",
  INVALID: "יש לתאר כל שלב ולהשלים אחוזים תקינים לסכום של 100%.",
  LIMIT: "אפשר להוסיף עד 30 שלבי תשלום.",
  LEGACY: "מותאם אישית — טרם הוגדרו שלבי תשלום",
  CUSTOMER_HELP: "ברירת המחדל תועתק להצעות חדשות. שינוי לא יעדכן הצעות קיימות.",
  DEFAULT_TITLE: "תנאי תשלום כברירת מחדל",
  SAVE_DEFAULT: "שמירת ברירת מחדל",
  SAVED: "ברירת המחדל נשמרה",
  QUOTE_HELP: "תנאי התשלום נשמרים בהצעה זו בלבד. אפשר לשנות אותם בלי לשנות את הלקוח.",
  CHANGED: "הלקוח השתנה. תנאי התשלום בהצעה נשמרו.",
  DEFAULT_AVAILABLE: "אפשר להחליף את תנאי ההצעה בברירת המחדל העדכנית של הלקוח.",
  APPLY: "החלפת תנאי התשלום בתנאי הלקוח",
  APPLY_HELP: "השלבים יוחלפו; הערת ההצעה תישאר.",
  NO_DEFAULT: "לא הוגדרו תנאי תשלום ללקוח; תנאי ההצעה נשארו ללא שינוי.",
  LOADING: "טוען את תנאי התשלום של הלקוח...",
  RETRY: "נסה שוב",
} as const;

export const PAYMENT_CONFIGURATION_CHOICES = { NONE: "none", STAGES: "stages" } as const;
