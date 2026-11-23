export const PROJECT_CONTACT_ROLES = {
  ARCHITECT: "architect",
  PROJECT_MANAGER: "project_manager",
  CONSULTANT: "consultant",
} as const;

export type ProjectContactRoleType =
  (typeof PROJECT_CONTACT_ROLES)[keyof typeof PROJECT_CONTACT_ROLES];

export const PROJECT_CONTACT_ROLE_LABELS: Record<ProjectContactRoleType, string> = {
  architect: "אדריכל",
  project_manager: "מנהל פרויקט",
  consultant: "יועץ",
};

export const PROJECT_CONTACT_ROLE_COPY = {
  TITLE: "אנשי קשר בפרויקט",
  EMPTY: "לא שויך איש קשר",
  SEARCH: "חיפוש לפי שם, טלפון או דוא״ל",
  SHARED_EDIT: "שינוי הפרטים יעודכן גם בפרויקטים אחרים המשתמשים באיש הקשר",
  INSTANT_SAVE: "שינוי שיוך או פרטי איש קשר נשמר מיד, בנפרד משמירת הפרויקט.",
} as const;
