import type {
  ICustomerContact,
  ICustomerContactDraft,
} from "../interfaces/customer-contact.interface";

import { toCustomerContactInput } from "../utilities/customer-contact.utility";
import { isContactInputEqual } from "../utilities/project-contact-role.utility";
import { contactDirectoryService } from "../services/contact-directory.service";
import { PROJECT_CONTACT_ROLE_COPY } from "../constants/project-contact-role.constant";

interface ISaveRoleContact {
  canEditCreated?: boolean;
  draft: ICustomerContactDraft;
  created: ICustomerContact | null;
  existing: ICustomerContact | null;
  onCreated: (contact: ICustomerContact) => void;
  onSelect: (contact: ICustomerContact) => void | Promise<void>;
}

export const saveRoleContactAction = async ({
  draft,
  existing,
  created,
  onCreated,
  onSelect,
  canEditCreated = false,
}: ISaveRoleContact): Promise<void> => {
  const input = toCustomerContactInput(draft);
  const previous = existing ?? created;
  const isRetryUnchanged = created !== null && isContactInputEqual(created, input);
  const hasChangedCreatedContact = created !== null && !isRetryUnchanged;
  if (hasChangedCreatedContact && !canEditCreated) {
    throw new Error(PROJECT_CONTACT_ROLE_COPY.CREATED_PENDING);
  }

  const saved = isRetryUnchanged ? created : null;
  const contact =
    saved ??
    (previous
      ? await contactDirectoryService.update(previous.id, input)
      : await contactDirectoryService.create(input));
  if (!existing) {
    onCreated(contact);
  }

  await onSelect(contact);
};
