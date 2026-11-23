import type {
  ICustomerContactDraft,
  ICustomerContactInput,
} from "../interfaces/customer-contact.interface";

import { projectContactService } from "../services/project-contact.service";
import { toCustomerContactInput } from "../utilities/customer-contact.utility";
import { contactDirectoryService } from "../services/contact-directory.service";

interface ISaveProjectContactAction {
  projectId: string;
  isFirstContact: boolean;
  contactId: string | null;
  draft: ICustomerContactDraft;
  createdContactId: string | null;
  onContactCreated: (contactId: string) => void;
}

interface ISaveDirectoryContact {
  contactId: string | null;
  input: ICustomerContactInput;
  createdContactId: string | null;
}

const saveDirectoryContact = async ({
  input,
  contactId,
  createdContactId,
}: ISaveDirectoryContact) => {
  if (contactId) {
    return contactDirectoryService.update(contactId, input);
  }
  if (createdContactId) {
    return { id: createdContactId };
  }
  return contactDirectoryService.create(input);
};

export const saveProjectContactAction = async ({
  projectId,
  draft,
  contactId,
  createdContactId,
  isFirstContact,
  onContactCreated,
}: ISaveProjectContactAction) => {
  const input = toCustomerContactInput(draft);
  const contact = await saveDirectoryContact({ input, contactId, createdContactId });
  if (!contactId && !createdContactId) {
    onContactCreated(contact.id);
  }
  if (!contactId) {
    await projectContactService.link(projectId, {
      contactId: contact.id,
      role: input.role,
      isPrimary: isFirstContact,
    });
  }
  return contact;
};
