export const FIELD_TYPES = {
  TZ: "tz",
  NAME: "name",
  TEXT: "text",
  DATE: "date",
  PHONE: "phone",
  EMAIL: "email",
  NUMBER: "number",
  SEARCH: "search",
  PASSWORD: "password",
} as const;

export type TFieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

export const ALLOWED_FIELD_TYPES: readonly TFieldType[] = Object.values(FIELD_TYPES);

export const LTR_FIELD_TYPES: readonly TFieldType[] = [FIELD_TYPES.EMAIL, FIELD_TYPES.DATE];

export const KEYBOARD_TYPE_MAP: Record<TFieldType, React.HTMLInputTypeAttribute> = {
  tz: "number",
  name: "text",
  text: "text",
  date: "date",
  phone: "tel",
  email: "email",
  number: "number",
  search: "search",
  password: "password",
};
