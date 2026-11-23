import type { ICustomerContact } from "../interfaces/customer-contact.interface";
import { PROJECT_CONTACT_ROLES } from "../constants/project-contact-role.constant";
import type { ProjectContactRoleType } from "../constants/project-contact-role.constant";
import type { TProjectRoleContacts } from "../interfaces/project-contact-role.interface";
import type {
  IProjectContactLink,
  IProjectContactInput,
} from "../interfaces/project-contact.interface";

export const isProjectContactRole = (role: string | null): role is ProjectContactRoleType =>
  Object.values(PROJECT_CONTACT_ROLES).some(value => value === role);

export const emptyProjectRoleContacts = (): TProjectRoleContacts => ({
  architect: null,
  project_manager: null,
  consultant: null,
});

export const projectRoleContactsFromLinks = (
  links: IProjectContactLink[],
): TProjectRoleContacts => ({
  architect: links.find(link => link.role === PROJECT_CONTACT_ROLES.ARCHITECT)?.contact ?? null,
  project_manager:
    links.find(link => link.role === PROJECT_CONTACT_ROLES.PROJECT_MANAGER)?.contact ?? null,
  consultant: links.find(link => link.role === PROJECT_CONTACT_ROLES.CONSULTANT)?.contact ?? null,
});

export const projectRoleContactInputs = (contacts: TProjectRoleContacts): IProjectContactInput[] =>
  Object.values(PROJECT_CONTACT_ROLES).flatMap(role => {
    const contact = contacts[role];
    return contact ? [{ contactId: contact.id, role, isPrimary: false }] : [];
  });

export const contactAutocompleteItem = (contact: ICustomerContact) => ({
  value: contact.id,
  label: contact.name,
  description: contact.phone ?? contact.email ?? "",
});

export const setProjectRoleContact = (
  contacts: TProjectRoleContacts,
  role: ProjectContactRoleType,
  contact: ICustomerContact | null,
): TProjectRoleContacts => {
  const assignedElsewhere = Object.values(PROJECT_CONTACT_ROLES).some(
    currentRole =>
      currentRole !== role && contact !== null && contacts[currentRole]?.id === contact.id,
  );
  if (assignedElsewhere) {
    throw new Error("איש הקשר כבר משויך לתפקיד אחר בפרויקט");
  }

  return { ...contacts, [role]: contact };
};

export const projectContactCreationInputs = (
  roles: TProjectRoleContacts,
  additional: ICustomerContact[],
): IProjectContactInput[] => {
  const roleInputs = projectRoleContactInputs(roles);
  const additionalInputs = additional
    .filter(contact => !roleInputs.some(input => input.contactId === contact.id))
    .map((contact, index) => ({ contactId: contact.id, role: null, isPrimary: index === 0 }));
  return [...roleInputs, ...additionalInputs];
};
