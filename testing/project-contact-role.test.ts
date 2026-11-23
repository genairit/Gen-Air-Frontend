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
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const { createElement } = await import("react");
  const { act, create } = await import("react-test-renderer");
  const { QueryClient, QueryClientProvider } = await import("@tanstack/react-query");
  const { default: ProjectContactRoleFields } =
    await import("../src/components/ProjectContactRoles/ProjectContactRoleFields");
  const contacts = setProjectRoleContact(
    emptyProjectRoleContacts(),
    PROJECT_CONTACT_ROLES.ARCHITECT,
    { ...contact, phone: "+972541234567" },
  );
  const client = new QueryClient();
  const renderer = await act(async () =>
    create(
      createElement(
        QueryClientProvider,
        { client },
        createElement(ProjectContactRoleFields, {
          canEdit: false,
          disabled: false,
          canEditDetails: false,
          contacts,
          onChange: () => {},
        }),
      ),
    ),
  );
  try {
    const rendered = JSON.stringify(renderer.toJSON());
    assert.match(rendered, /אדריכל/);
    assert.match(rendered, /מנהל פרויקט/);
    assert.match(rendered, /יועץ/);
    assert.equal(rendered.split("לא שויך איש קשר").length - 1, 2);
    assert.equal(
      renderer.root.findAllByType("a").find(link => link.props.href === "tel:+972541234567")?.props
        .dir,
      "ltr",
    );
    assert.equal(
      renderer.root
        .findAllByType("a")
        .find(link => link.props.href === "mailto:architect@example.test")?.props.dir,
      "ltr",
    );
    assert.doesNotMatch(rendered, /הוסף יועץ|ערוך פרטי/);
  } finally {
    await act(async () => renderer.unmount());
    client.clear();
  }
});

test("an authorized edited retry updates the existing created contact instead of silently reusing stale details", async () => {
  const original = contactDirectoryService.update;
  const updates: string[] = [];
  const selections: ICustomerContact[] = [];
  contactDirectoryService.update = async (id, input) => {
    updates.push(id);
    return { ...contact, ...input };
  };
  try {
    await saveRoleContactAction({
      draft: { name: "שם מתוקן", phone: "", email: "corrected@example.test", role: "" },
      existing: null,
      created: contact,
      canEditCreated: true,
      onCreated: () => {},
      onSelect: value => {
        selections.push(value);
      },
    });
    assert.deepEqual(updates, [contact.id]);
    assert.equal(selections[0].name, "שם מתוקן");
    assert.equal(selections[0].email, "corrected@example.test");
  } finally {
    contactDirectoryService.update = original;
  }
});

test("changed created contact details cannot be silently dropped without edit permission", async () => {
  await assert.rejects(
    saveRoleContactAction({
      draft: { name: "שם מתוקן", phone: "", email: "", role: "" },
      existing: null,
      created: contact,
      onCreated: () => {},
      onSelect: () => {
        assert.fail("should not link stale details");
      },
    }),
    /הרשאה/,
  );
});

test("inline editor keeps the containing form blocked until save completes or the editor is cancelled", async () => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const { installDomEventTargets } = await import("./dom-event-targets.utility");
  const restoreDom = installDomEventTargets();
  const { createElement } = await import("react");
  const { act, create } = await import("react-test-renderer");
  const { QueryClient, QueryClientProvider } = await import("@tanstack/react-query");
  const { default: RoleField } =
    await import("../src/components/ProjectContactRoles/ProjectContactRoleField");
  const { default: Button } = await import("../src/components/Button/Button");
  const { default: Editor } =
    await import("../src/components/CustomerContacts/CustomerContactEditor");
  const pending = Promise.withResolvers<ICustomerContact>();
  const original = contactDirectoryService.create;
  const events: boolean[] = [];
  const client = new QueryClient();
  contactDirectoryService.create = () => pending.promise;
  const renderer = await act(async () =>
    create(
      createElement(
        QueryClientProvider,
        { client },
        createElement(RoleField, {
          role: PROJECT_CONTACT_ROLES.ARCHITECT,
          contact: null,
          canEdit: true,
          canCreateContact: true,
          canEditDetails: true,
          disabled: false,
          onSelect: async () => {},
          onActivityChange: active => {
            events.push(active);
          },
        }),
      ),
    ),
  );
  try {
    const add = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === "הוסף אדריכל");
    assert.ok(add);
    await act(async () => add.props.onClick());
    assert.equal(events.at(-1), true);
    await act(async () =>
      renderer.root
        .findByType(Editor)
        .props.onChange({ name: contact.name, phone: "", email: contact.email, role: "" }),
    );
    await act(async () => renderer.root.findByType(Editor).props.onSave());
    assert.equal(events.at(-1), true);
    await act(async () => {
      pending.resolve(contact);
      await pending.promise;
    });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    assert.equal(events.at(-1), false);
    await act(async () => add.props.onClick());
    assert.equal(events.at(-1), true);
    await act(async () => renderer.root.findByType(Editor).props.onCancel());
    assert.equal(events.at(-1), false);
  } finally {
    await act(async () => renderer.unmount());
    contactDirectoryService.create = original;
    client.clear();
    restoreDom();
  }
});
