import {
  USER_ROLE_LABELS,
  AVATAR_TONE_BY_ROLE,
  PROJECT_ROLE_DESCRIPTIONS,
  type ProjectMemberRoleType,
} from "../../constants/user-role.constant";

import { getInitials } from "../text.utility";
import type { IApiUser } from "../../interfaces/api.interface";
import type { IPerson } from "../../interfaces/person.interface";
import type { IEmployee } from "../../interfaces/employee.interface";

export const getFullName = (user: IApiUser) => `${user.firstName} ${user.lastName}`;

const toUserOptionLabel = (user: IApiUser) => `${getFullName(user)} (${user.employeeNumber})`;

export const toPerson = (user: IApiUser): IPerson => ({
  name: getFullName(user),
  caption: USER_ROLE_LABELS[user.role],
  initials: getInitials(getFullName(user)),
  avatarTone: AVATAR_TONE_BY_ROLE[user.role],
});

export const toEmployee = (user: IApiUser): IEmployee => ({
  id: user.id,
  role: user.role,
  phone: user.phone,
  email: user.email,
  isDisabled: user.deletedAt != null,
  person: { ...toPerson(user), caption: `מזהה: ${user.employeeNumber}` },
});

export const toUserOptions = (users: IApiUser[]) =>
  users.map(user => ({ id: user.id, label: toUserOptionLabel(user) }));

export const toRolePerson = (role: ProjectMemberRoleType): IPerson => ({
  name: USER_ROLE_LABELS[role],
  caption: PROJECT_ROLE_DESCRIPTIONS[role],
  initials: getInitials(USER_ROLE_LABELS[role]),
});
