export const PROJECT_CONSTRAINT_COPY = {
  NAME_HINT: "הכותרת הרשמית בכל חישובי ההנדסה וההזמנות · השם ייחודי בכל המערכת (תלוי רישיות)",
  DUPLICATE_NAME: "קיים כבר פרויקט בשם זה. יש לבחור שם אחר (ההשוואה תלוית רישיות)",
  NAME_CHECKING: "בודק אם השם פנוי…",
  NAME_CHECK_FAILED: "לא ניתן לבדוק כרגע אם השם פנוי. יש לנסות שוב.",
  RETRY: "נסה שוב",
  LIGHTING_TITLE: "הנמכה כללית לתאורה",
  LIGHTING_SUBTITLE: "הפרויקט כולל הנמכת תקרה כללית לצורכי תאורה",
  HEIGHT_LABEL: "גובה הנמכה",
  HEIGHT_HINT: "ערך מספרי בסנטימטרים",
  HEIGHT_REQUIRED: "יש להזין גובה במספר",
  HEIGHT_INVALID: "הערך חייב להיות מספר (ללא אותיות)",
  HEIGHT_PLACEHOLDER: "לדוגמה: 25",
  HEIGHT_UNIT: "ס״מ",
} as const;

export const PROJECT_CONSTRAINTS = {
  HEIGHT_INPUT_SLOTS: { htmlInput: { inputMode: "decimal" } },
  NAME_CONFLICT_CODE: "PROJECT_NAME_ALREADY_EXISTS",
  HEIGHT_PATTERN: /^\d+(\.\d+)?$/,
} as const;
