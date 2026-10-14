import { AVATAR_TONES, type AvatarToneType } from "./tone.constant";

export const USER_ROLES = {
  SECRETARY: "secretary",
  SYSTEM_ADMIN: "system_admin",
  LEAD_INSTALLER: "lead_installer",
  PROJECT_MANAGER: "project_manager",
} as const;

export type UserRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_VALUES: UserRoleType[] = Object.values(USER_ROLES);

export const USER_ROLE_LABELS: Record<UserRoleType, string> = {
  secretary: "מזכירה",
  system_admin: "מנהל מערכת",
  lead_installer: "מתקין ראשי",
  project_manager: "מנהל פרויקט",
};

export const USER_ROLE_PLURAL_LABELS: Record<UserRoleType, string> = {
  secretary: "מזכירות",
  system_admin: "מנהלי מערכת",
  lead_installer: "מתקינים",
  project_manager: "מנהלי פרויקטים",
};

export const AVATAR_TONE_BY_ROLE: Record<UserRoleType, AvatarToneType> = {
  secretary: AVATAR_TONES.AIR,
  lead_installer: AVATAR_TONES.AIR,
  system_admin: AVATAR_TONES.CHARCOAL,
  project_manager: AVATAR_TONES.CHARCOAL,
};

export const PROJECT_ROLE_SLOTS: UserRoleType[] = [
  USER_ROLES.SYSTEM_ADMIN,
  USER_ROLES.SECRETARY,
  USER_ROLES.PROJECT_MANAGER,
  USER_ROLES.LEAD_INSTALLER,
];

export const PROJECT_ROLE_DESCRIPTIONS: Record<UserRoleType, string> = {
  secretary: "תיאום ואדמיניסטרציה",
  system_admin: "מנהל מערכת ראשי",
  project_manager: "ניהול הנדסי וביצוע",
  lead_installer: "ראש צוות התקנות שטח",
};

export const ROLE_PERMISSIONS = {
  MANAGE_TASKS: [USER_ROLES.SYSTEM_ADMIN, USER_ROLES.PROJECT_MANAGER],
  UPDATE_TASK_STATUS: USER_ROLE_VALUES,
  MANAGE_USERS: [USER_ROLES.SYSTEM_ADMIN],
  MANAGE_SETTINGS: [USER_ROLES.SYSTEM_ADMIN],
  DELETE_PROJECTS: [USER_ROLES.SYSTEM_ADMIN, USER_ROLES.PROJECT_MANAGER],
  EDIT_PROJECTS: [USER_ROLES.SYSTEM_ADMIN, USER_ROLES.SECRETARY, USER_ROLES.PROJECT_MANAGER],
} as const satisfies Record<string, readonly UserRoleType[]>;

export type PermissionType = keyof typeof ROLE_PERMISSIONS;

export const USER_ROLE_OPTIONS = USER_ROLE_VALUES.map(role => ({
  id: role,
  label: USER_ROLE_LABELS[role],
}));
