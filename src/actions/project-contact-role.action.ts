import type {
  ICustomerContact,
  ICustomerContactDraft,
} from "../interfaces/customer-contact.interface";

import { toCustomerContactInput } from "../utilities/customer-contact.utility";
import { contactDirectoryService } from "../services/contact-directory.service";

interface ISaveRoleContact {
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
}: ISaveRoleContact): Promise<void> => {
  const input = toCustomerContactInput(draft);
  const contact = existing
    ? await contactDirectoryService.update(existing.id, input)
    : (created ?? (await contactDirectoryService.create(input)));
  if (!existing && !created) {
    onCreated(contact);
  }

  await onSelect(contact);
};
