import {
  toIntakePayload,
  createEmptyIntakeValues,
  getRequiredIntakeGroups,
} from "../src/utilities/project-intake.utility";

import {
  isCustomerContactList,
  toCustomerContactDraft,
  toCustomerContactInput,
  validateCustomerContactDraft,
} from "../src/utilities/customer-contact.utility";

import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { httpClient } from "../src/services/http-client.service";
import { PERMISSIONS } from "../src/constants/permission.constant";
import { hasPermission } from "../src/utilities/permission.utility";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { customerContactService } from "../src/services/customer-contact.service";
import { saveCustomerContactAction } from "../src/actions/customer-contact.action";
import CustomerContacts from "../src/components/CustomerContacts/CustomerContacts";
import CustomerContactItem from "../src/components/CustomerContacts/CustomerContactItem";
import { CUSTOMER_CONTACT_QUERY_ROOT } from "../src/constants/customer-contact.constant";
import CustomerContactEditor from "../src/components/CustomerContacts/CustomerContactEditor";

const contact = {
  id: "contact-1",
  customerId: "customer-1",
  name: "איש קשר ראשון",
  phone: null,
  email: null,
  role: null,
};
const noop = () => {};

test("name is required; optional contact fields serialize to null", () => {
  const draft = { name: "  ישראל ישראלי ", phone: " ", email: "", role: "" };
  assert.deepEqual(validateCustomerContactDraft(draft), []);
  assert.deepEqual(toCustomerContactInput(draft), {
    name: "ישראל ישראלי",
    phone: null,
    email: null,
    role: null,
  });
  assert.equal(validateCustomerContactDraft(toCustomerContactDraft(null)).length, 1);
});

test("invalid supplied email, phone, role and name are rejected", () => {
  assert.equal(
    validateCustomerContactDraft({
      name: "א",
      phone: "+97255555555",
      email: "bad",
      role: "א".repeat(61),
    }).length,
    4,
  );
  assert.deepEqual(
    validateCustomerContactDraft({
      name: "ישראל",
      phone: "03-1234567",
      email: "person@example.com",
      role: "מנהל",
    }),
    [],
  );
});

test("response guard requires contact identity and nullable optional fields", () => {
  assert.equal(isCustomerContactList([contact]), true);
  assert.equal(isCustomerContactList([null]), false);
  assert.equal(isCustomerContactList([{ ...contact, customerId: null }]), false);
  assert.equal(isCustomerContactList([{ ...contact, phone: 5 }]), false);
  assert.equal(isCustomerContactList({ items: [contact] }), false);
});

test("contact display has no delete or arbitrary primary-contact designation", () => {
  const markup = renderToStaticMarkup(<CustomerContactItem onEdit={null} contact={contact} />);
  assert.match(markup, /איש קשר ראשון/);
  assert.doesNotMatch(markup, /מחיקה|ראשי|עריכה/);
});

test("editor renders validation and API errors with disabled invalid submission", () => {
  const markup = renderToStaticMarkup(
    <CustomerContactEditor
      busy={false}
      onSave={noop}
      onCancel={noop}
      onChange={noop}
      error="שגיאת שרת"
      values={toCustomerContactDraft(null)}
    />,
  );
  assert.match(markup, /שגיאת שרת/);
  assert.match(markup, /יש להזין שם איש קשר תקין/);
  assert.match(markup, /disabled/);
});

test("contact endpoints preserve ownership and nullable payloads for create and edit", async () => {
  const previousAdapter = httpClient.defaults.adapter;
  const calls: { url: string; method: string; data: string | null }[] = [];
  httpClient.defaults.adapter = async config => {
    calls.push({
      url: config.url ?? "",
      method: config.method ?? "",
      data: typeof config.data === "string" ? config.data : null,
    });
    return {
      data: config.method === "get" ? [contact] : contact,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };
  try {
    assert.deepEqual(await customerContactService.getAll(contact.customerId), [contact]);
    const values = toCustomerContactDraft(contact);
    await saveCustomerContactAction({
      customerId: contact.customerId,
      editor: { id: null, values },
    });
    await saveCustomerContactAction({
      customerId: contact.customerId,
      editor: { id: contact.id, values },
    });
    assert.deepEqual(
      calls.map(({ url, method }) => ({ url, method })),
      [
        { url: "/customer/customer-1/contacts", method: "get" },
        { url: "/customer/customer-1/contacts", method: "post" },
        { url: "/customer/customer-1/contacts/contact-1", method: "patch" },
      ],
    );
    assert.deepEqual(JSON.parse(calls[1].data ?? ""), {
      name: contact.name,
      role: null,
      email: null,
      phone: null,
    });
  } finally {
    httpClient.defaults.adapter = previousAdapter;
  }
});

test("invalid API responses and write failures propagate instead of reporting success", async () => {
  const previousAdapter = httpClient.defaults.adapter;
  httpClient.defaults.adapter = async config => ({
    data: {},
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  });
  try {
    await assert.rejects(customerContactService.getAll(contact.customerId), /Unexpected response/);
    httpClient.defaults.adapter = async () => {
      throw new Error("failed save");
    };
    await assert.rejects(
      saveCustomerContactAction({
        customerId: contact.customerId,
        editor: { id: null, values: toCustomerContactDraft(contact) },
      }),
      /failed save/,
    );
  } finally {
    httpClient.defaults.adapter = previousAdapter;
  }
});

test("contact management permission matches backend and project views stay read-only", () => {
  const admin = {
    id: "test-admin",
    email: "test@example.com",
    phone: "",
    lastName: "Test",
    firstName: "Test",
    employeeNumber: "",
    deletedAt: null,
    role: USER_ROLES.SYSTEM_ADMIN,
    permissions: [PERMISSIONS.CUSTOMERS_READ, PERMISSIONS.CUSTOMERS_UPDATE],
  };
  assert.equal(hasPermission(admin, PERMISSIONS.CUSTOMERS_UPDATE), true);
  assert.equal(hasPermission({ ...admin, permissions: [] }, PERMISSIONS.CUSTOMERS_UPDATE), false);
  assert.equal(hasPermission(null, PERMISSIONS.CUSTOMERS_UPDATE), false);
  const client = new QueryClient();
  client.setQueryData([CUSTOMER_CONTACT_QUERY_ROOT, contact.customerId], [contact]);
  const markup = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <CustomerContacts editable customerId={contact.customerId} />
    </QueryClientProvider>,
  );
  assert.doesNotMatch(markup, /הוספת איש קשר/);
});

test("new project payload excludes duplicate contact fields but retains site address and terms", () => {
  const values = createEmptyIntakeValues();
  values.contact = {
    contactName: "old unsaved draft",
    contactPhone: "0501234567",
    contactRole: "role",
  };
  const payload = toIntakePayload(values, null);
  assert.equal(Reflect.has(payload, "contactName"), false);
  assert.equal(Reflect.has(payload, "contactPhone"), false);
  assert.equal(Reflect.has(payload, "contactRole"), false);
  assert.equal(Reflect.has(payload, "addressPlaceId"), true);
  assert.equal(Reflect.has(payload, "paymentTerms"), true);
  assert.equal(getRequiredIntakeGroups(values, null).contact, false);
});

test("legacy project edit keeps unchanged contact data untouched", () => {
  const original = createEmptyIntakeValues();
  original.contact = {
    contactName: "legacy name",
    contactPhone: "0501234567",
    contactRole: "site role",
  };
  assert.deepEqual(toIntakePayload(original, original), {});
  const changed = { ...original, contact: { ...original.contact, contactRole: "new site role" } };
  assert.deepEqual(toIntakePayload(changed, original), {
    contactName: "legacy name",
    contactPhone: "0501234567",
    contactRole: "new site role",
  });
});

test("contact name and email length boundaries match backend limits", () => {
  const email = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(61)}`;
  assert.equal(email.length, 254);
  const draft = { name: "א".repeat(200), email, phone: "", role: "" };
  assert.deepEqual(validateCustomerContactDraft(draft), []);
  assert.equal(validateCustomerContactDraft({ ...draft, name: `${draft.name}א` }).length, 1);
  assert.equal(validateCustomerContactDraft({ ...draft, email: `${email}d` }).length, 1);
});
