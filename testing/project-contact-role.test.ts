import {
  setProjectRoleContact,
  emptyProjectRoleContacts,
  projectRoleContactsFromLinks,
  projectContactCreationInputs,
} from "../src/utilities/project-contact-role.utility";

import { test } from "node:test";
import assert from "node:assert/strict";
import { saveRoleContactAction } from "../src/actions/project-contact-role.action";
import { contactDirectoryService } from "../src/services/contact-directory.service";
import type { ICustomerContact } from "../src/interfaces/customer-contact.interface";
import { PROJECT_CONTACT_ROLES } from "../src/constants/project-contact-role.constant";

const contact: ICustomerContact = {
  id: "contact-1",
  name: "אדריכל לבדיקה",
  email: "architect@example.test",
  phone: null,
  role: null,
  customerId: null,
};

test("all three roles exist when no project contact is linked", () => {
  assert.deepEqual(emptyProjectRoleContacts(), {
    architect: null,
    project_manager: null,
    consultant: null,
  });
  assert.deepEqual(projectRoleContactsFromLinks([]), emptyProjectRoleContacts());
});

test("legacy untyped directory contacts are not assigned an invented role", () => {
  const links = [
    { projectId: "p", contactId: contact.id, isPrimary: true, role: "אדריכל", contact },
  ];
  assert.deepEqual(projectRoleContactsFromLinks(links), emptyProjectRoleContacts());
  assert.equal(
    projectRoleContactsFromLinks([{ ...links[0], role: PROJECT_CONTACT_ROLES.ARCHITECT }]).architect
      ?.id,
    contact.id,
  );
});

test("one contact cannot occupy two named slots; remove and replacement are explicit", () => {
  const selected = setProjectRoleContact(
    emptyProjectRoleContacts(),
    PROJECT_CONTACT_ROLES.ARCHITECT,
    contact,
  );
  assert.throws(
    () => setProjectRoleContact(selected, PROJECT_CONTACT_ROLES.CONSULTANT, contact),
    /תפקיד אחר/,
  );
  const cleared = setProjectRoleContact(selected, PROJECT_CONTACT_ROLES.ARCHITECT, null);
  assert.equal(cleared.architect, null);
  assert.equal(selected.architect?.id, contact.id);
});

test("project creation preserves stable role and avoids duplicate generic links", () => {
  const selected = setProjectRoleContact(
    emptyProjectRoleContacts(),
    PROJECT_CONTACT_ROLES.ARCHITECT,
    contact,
  );
  const additional = { ...contact, id: "contact-2", name: "עוד איש קשר" };
  assert.deepEqual(projectContactCreationInputs(selected, [contact, additional]), [
    { contactId: contact.id, role: PROJECT_CONTACT_ROLES.ARCHITECT, isPrimary: false },
    { contactId: additional.id, role: null, isPrimary: true },
  ]);
});

test("a failed role assignment retries without creating a duplicate contact", async () => {
  const original = contactDirectoryService.create;
  const createdContacts: ICustomerContact[] = [];
  const links: ICustomerContact[] = [];
  contactDirectoryService.create = async () => {
    createdContacts.push(contact);
    return contact;
  };
  const saved: { contact: ICustomerContact | null } = { contact: null };
  const input = {
    draft: { name: contact.name, phone: "", email: contact.email ?? "", role: "" },
    existing: null,
    onCreated: (value: ICustomerContact) => {
      saved.contact = value;
    },
    onSelect: async (value: ICustomerContact) => {
      links.push(value);
      if (links.length === 1) {
        throw new Error("link failed");
      }
    },
  };
  try {
    await assert.rejects(saveRoleContactAction({ ...input, created: null }), /link failed/);
    await saveRoleContactAction({ ...input, created: saved.contact });
    assert.equal(createdContacts.length, 1);
    assert.equal(links.length, 2);
  } finally {
    contactDirectoryService.create = original;
  }
});

test("read-only role fields always render all roles and isolate phone/email direction", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { QueryClient, QueryClientProvider } = await import("@tanstack/react-query");
  const { default: ProjectContactRoleFields } =
    await import("../src/components/ProjectContactRoles/ProjectContactRoleFields");
  const contacts = setProjectRoleContact(
    emptyProjectRoleContacts(),
    PROJECT_CONTACT_ROLES.ARCHITECT,
    { ...contact, phone: "+972541234567" },
  );
  const html = renderToStaticMarkup(
    createElement(
      QueryClientProvider,
      { client: new QueryClient() },
      createElement(ProjectContactRoleFields, {
        canEdit: false,
        disabled: false,
        canEditDetails: false,
        contacts,
        onChange: () => {},
      }),
    ),
  );
  assert.match(html, /אדריכל/);
  assert.match(html, /מנהל פרויקט/);
  assert.match(html, /יועץ/);
  assert.equal(html.split("לא שויך איש קשר").length - 1, 2);
  assert.match(html, /href="tel:\+972541234567"/);
  assert.match(html, /href="mailto:architect@example.test"/);
  assert.match(html, /dir="ltr"/);
  assert.doesNotMatch(html, /הוסף יועץ|ערוך פרטי/);
});
