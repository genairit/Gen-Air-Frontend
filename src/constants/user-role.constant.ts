import { AVATAR_TONES, type AvatarToneType } from "./tone.constant";

export const USER_ROLES = {
  FINANCE: "finance",
  ENGINEER: "engineer",
  INSTALLER: "installer",
  SECRETARY: "secretary",
  SYSTEM_ADMIN: "system_admin",
  PROJECT_MANAGER: "project_manager",
} as const;

export type UserRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_VALUES: UserRoleType[] = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.ENGINEER,
  USER_ROLES.SECRETARY,
  USER_ROLES.PROJECT_MANAGER,
  USER_ROLES.FINANCE,
  USER_ROLES.INSTALLER,
];

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
  secretary: "מזכירה",
  system_admin: "הנהלה / מנהל מערכת",
  project_manager: "מנהל פרויקט",
};

export const USER_ROLE_PLURAL_LABELS: Record<UserRoleType, string> = {
  finance: "כספים",
  engineer: "הנדסה",
  installer: "מתקינים",
  secretary: "מזכירות",
  system_admin: "הנהלה",
  project_manager: "מנהלי פרויקטים",
};

export const AVATAR_TONE_BY_ROLE: Record<UserRoleType, AvatarToneType> = {
  finance: AVATAR_TONES.AIR,
  engineer: AVATAR_TONES.AIR,
  installer: AVATAR_TONES.AIR,
  secretary: AVATAR_TONES.AIR,
  system_admin: AVATAR_TONES.CHARCOAL,
  project_manager: AVATAR_TONES.CHARCOAL,
};

export const PROJECT_ROLE_DESCRIPTIONS: Record<ProjectMemberRoleType, string> = {
  engineer: "תכנון, חישובים ומשימות הנדסה",
  installer: "יומן טכנאים, צ׳קליסט ותיעוד ל-Drive",
  secretary: "יומן עבודות וסטטוסים שוטפים ללקוח",
  project_manager: "ניהול התיק בשלב הביצוע בשטח",
};

const PROJECT_EDITOR_ROLES = [
  USER_ROLES.SECRETARY,
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.PROJECT_MANAGER,
];

export const ROLE_PERMISSIONS = {
  CLAIM_TASKS: [USER_ROLES.ENGINEER],
  MANAGE_TASKS: [USER_ROLES.SYSTEM_ADMIN],
  MANAGE_USERS: [USER_ROLES.SYSTEM_ADMIN],
  EDIT_PROJECTS: PROJECT_EDITOR_ROLES,
  MANAGE_SETTINGS: [USER_ROLES.SYSTEM_ADMIN],
  CREATE_PROJECTS: [USER_ROLES.SYSTEM_ADMIN],
  DELETE_PROJECTS: [USER_ROLES.SYSTEM_ADMIN],
  MANAGE_CUSTOMERS: [USER_ROLES.SYSTEM_ADMIN],
  MOVE_PROJECT_STAGE: PROJECT_EDITOR_ROLES,
  UPDATE_TASK_STATUS: [USER_ROLES.SYSTEM_ADMIN, USER_ROLES.ENGINEER],
} as const satisfies Record<string, readonly UserRoleType[]>;

export type PermissionType = keyof typeof ROLE_PERMISSIONS;

export const USER_ROLE_OPTIONS = USER_ROLE_VALUES.map(role => ({
  id: role,
  label: USER_ROLE_LABELS[role],
}));
