import { AVATAR_TONES, type AvatarToneType } from "./tone.constant";

export const USER_ROLES = {
  FINANCE: "finance",
  ENGINEER: "engineer",
  INSTALLER: "installer",
  SALES_AGENT: "sales_agent",
  SECRETARY: "secretary",
  SYSTEM_ADMIN: "system_admin",
  PROJECT_MANAGER: "project_manager",
  PURCHASING_EXECUTION_MANAGER: "purchasing_execution_manager",
} as const;

export type UserRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_VALUES: UserRoleType[] = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.ENGINEER,
  USER_ROLES.SECRETARY,
  USER_ROLES.PROJECT_MANAGER,
  USER_ROLES.FINANCE,
  USER_ROLES.INSTALLER,
  USER_ROLES.PURCHASING_EXECUTION_MANAGER,
  USER_ROLES.SALES_AGENT,
];

export const ASSIGNABLE_USER_ROLE_VALUES: UserRoleType[] = USER_ROLE_VALUES.filter(
  role => role !== USER_ROLES.SALES_AGENT,
);

export const PROJECT_MEMBER_ROLES = [
  USER_ROLES.ENGINEER,
  USER_ROLES.SECRETARY,
  USER_ROLES.PROJECT_MANAGER,
  USER_ROLES.INSTALLER,
] as const satisfies readonly UserRoleType[];

export type ProjectMemberRoleType = (typeof PROJECT_MEMBER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRoleType, string> = {
  finance: "מחלקת כספים",
  engineer: "עובד הנדסה",
  installer: "מתקין",
  sales_agent: "תפקיד ישן: סוכן מכירות",
  secretary: "מזכירה",
  system_admin: "הנהלה / מנהל מערכת",
  project_manager: "מנהל פרויקט",
  purchasing_execution_manager: "מנהל רכש וביצוע",
};

export const USER_ROLE_PLURAL_LABELS: Record<UserRoleType, string> = {
  finance: "כספים",
  engineer: "הנדסה",
  installer: "מתקינים",
  sales_agent: "תפקיד ישן",
  secretary: "מזכירות",
  system_admin: "הנהלה",
  project_manager: "מנהלי פרויקטים",
  purchasing_execution_manager: "מנהלי רכש וביצוע",
};

export const AVATAR_TONE_BY_ROLE: Record<UserRoleType, AvatarToneType> = {
  finance: AVATAR_TONES.AIR,
  engineer: AVATAR_TONES.AIR,
  installer: AVATAR_TONES.AIR,
  sales_agent: AVATAR_TONES.AIR,
  secretary: AVATAR_TONES.AIR,
  system_admin: AVATAR_TONES.CHARCOAL,
  project_manager: AVATAR_TONES.CHARCOAL,
  purchasing_execution_manager: AVATAR_TONES.CHARCOAL,
};

export const PROJECT_ROLE_DESCRIPTIONS: Record<ProjectMemberRoleType, string> = {
  engineer: "תכנון, חישובים ומשימות הנדסה",
  installer: "יומן טכנאים, צ׳קליסט ותיעוד ל-Drive",
  secretary: "יומן עבודות וסטטוסים שוטפים ללקוח",
  project_manager: "ניהול התיק בשלב הביצוע בשטח",
};

export const USER_ROLE_OPTIONS = ASSIGNABLE_USER_ROLE_VALUES.map(role => ({
  id: role,
  label: USER_ROLE_LABELS[role],
}));
