import { PASSWORD_RULES } from "./password.constant";

export const SETTINGS_COPY = {
  TITLE: "הגדרות מערכת",
  LOADING: "טוען הגדרות...",
  NEW_PASSWORD: "סיסמה חדשה",
  CURRENT_PASSWORD: "סיסמה נוכחית",
  CURRENT_PASSWORD_INCORRECT: "הסיסמה הנוכחית שגויה",
  CONFIRM_PASSWORD: "אימות סיסמה",
  UPDATE_PASSWORD: "עדכן סיסמה",
  STAGES_TITLE: "סטטוסי פרויקט קבועים",
  STAGES_SUBTITLE:
    "סטטוסים בסדר קבוע. ניתן לשנות את סטטוס הפרויקט, אך לא את שמות הסטטוסים או את סדרם.",
  PASSWORD_TITLE: "עדכון סיסמה לחשבונך",
  PASSWORD_SUBTITLE: "שינוי הסיסמה מחייב אימות הסיסמה הנוכחית והתחברות מחדש",
  NEW_PASSWORD_PLACEHOLDER: "הזן סיסמה חדשה",
  NEW_PASSWORD_HINT: `(לפחות ${PASSWORD_RULES.MIN_LENGTH} תווים)`,
  CURRENT_PASSWORD_PLACEHOLDER: "הזן סיסמה נוכחית",
  CONFIRM_PASSWORD_PLACEHOLDER: "חזור על הסיסמה",
  DESCRIPTION: "צפייה בסטטוסי הפרויקטים וניהול החשבון.",
} as const;
