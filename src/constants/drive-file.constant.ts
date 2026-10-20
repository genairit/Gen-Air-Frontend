import type { IDriveFolderLocation } from "../interfaces/drive-file.interface";

export const DRIVE_FILE_COPY = {
  RETRY: "נסה שוב",
  ROOT: "תיקיית הפרויקט",
  DESTINATION: "תיקיית יעד",
  UPLOAD_DESTINATION: "יעד העלאה",
  CHOOSE_FOLDER: "בחירת תיקייה",
  SELECT_FOLDER: "בחר תיקייה זו",
  BACK: "לתיקייה הקודמת",
  MOVE: "העבר",
  MOVE_TITLE: "העברת קובץ",
  MOVE_CONFIRM: "העבר לתיקייה זו",
  DELETE: "מחיקה",
  DELETE_TITLE: "מחיקת קובץ",
  DELETE_CONFIRM: "העבר לאשפה",
  DELETE_DESCRIPTION: "הקובץ יועבר לאשפה ב-Google Drive וניתן יהיה לשחזר אותו משם.",
  CANCEL: "ביטול",
  CURRENT_FOLDER: "תיקייה נוכחית",
  LOADING: "טוען תיקיות…",
  NO_FOLDERS: "אין תיקיות משנה בתיקייה זו",
  FOLDER_ERROR: "לא ניתן לטעון את התיקייה. נסו שוב.",
  ACTION_ERROR: "לא ניתן לבצע את הפעולה. בדקו הרשאות וחיבור ל-Drive ונסו שוב.",
  MOVE_SUCCESS: "הקובץ הועבר בהצלחה",
  DELETE_SUCCESS: "הקובץ הועבר לאשפה",
  UPLOAD_SUCCESS: "הקבצים הועלו בהצלחה",
} as const;

export const ROOT_DRIVE_LOCATION: IDriveFolderLocation = {
  folderId: null,
  name: DRIVE_FILE_COPY.ROOT,
};

export const DRIVE_FILE_OPERATIONS = { MOVE: "move", TRASH: "trash" } as const;
export type DriveFileOperationType =
  (typeof DRIVE_FILE_OPERATIONS)[keyof typeof DRIVE_FILE_OPERATIONS];
