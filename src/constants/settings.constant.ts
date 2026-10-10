import type { IStatusStage } from "../interfaces/project.interface";

export const NEW_STATUS_STAGE_TEMPLATE: Omit<IStatusStage, "id"> = {
  tag: "טיוטה",
  name: "שלב חדש",
  description: "הגדר תיאור ופעולות אוטומטיות לשלב",
};

export const FOLDER_TEMPLATE_TAGS = ["{Project_ID}", "{Project_Name}"];

export const FOLDER_TEMPLATE_ROOT = "[Project_ID]_[Project_Name]";

export const FOLDER_TEMPLATE_ROOT_BADGE = "תיקיית שורש";

export const SETTINGS_COPY = {
  TITLE: "הגדרות מערכת",
  LOADING: "טוען הגדרות...",
  PASSWORD_UPDATED: "הסיסמה עודכנה בהצלחה",
  STAGES_SAVED: "שלבי הסטטוס נשמרו",
  SAVE: "שמור שינויים",
  ADD_STAGE: "הוסף שלב סטטוס",
  DELETE_STAGE: "מחק שלב",
  NEW_PASSWORD: "סיסמה חדשה",
  CONFIRM_PASSWORD: "אימות סיסמה",
  UPDATE_PASSWORD: "עדכן סיסמה",
  STAGES_TITLE: "ניהול שלבי סטטוס פרויקט",
  STAGES_SUBTITLE: "הגדרה, סידור ועדכון שלבי מחזור החיים",
  TEMPLATE_TITLE: "בונה תבנית תיקיות Google Drive",
  TEMPLATE_SUBTITLE: "הגדרת מבנה אוטומטי לכל פרויקט חדש",
  TEMPLATE_TAGS_LABEL: "תגיות דינמיות זמינות:",
  ADD_SUBFOLDER: "הוסף תת-תיקייה או כלל אוטומציה",
  PASSWORD_TITLE: "עדכון סיסמה לחשבונך",
  PASSWORD_SUBTITLE: "שינוי סיסמת הכניסה של המשתמש המחובר",
  NEW_PASSWORD_PLACEHOLDER: "הזן סיסמה חדשה",
  CONFIRM_PASSWORD_PLACEHOLDER: "חזור על הסיסמה",
  DESCRIPTION: "ניהול שלבי פרויקטים, היררכיית תיקיות Google Drive וניהול משתמשי המערכת.",
} as const;
