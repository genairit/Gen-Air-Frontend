import {
  normalizeCustomerForm,
  getCustomerFormErrors,
  countCustomerFormErrors,
} from "../src/utilities/customer-form.utility";

import {
  toIntakeValues,
  toIntakePayload,
  countIntakeErrors,
  createEmptyIntakeValues,
  getRequiredIntakeGroups,
} from "../src/utilities/project-intake.utility";

import {
  isCustomerContactList,
  toCustomerContactDraft,
  toCustomerContactInput,
  formatCustomerContactCount,
  formatCustomerPrimaryContact,
  validateCustomerContactDraft,
  getCustomerContactFieldErrors,
} from "../src/utilities/customer-contact.utility";

import { test } from "node:test";
import assert from "node:assert/strict";
import { AxiosError, AxiosHeaders } from "axios";
import { renderToStaticMarkup } from "react-dom/server";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { httpClient } from "../src/services/http-client.service";
import type { IApiProject } from "../src/interfaces/api.interface";
import { PERMISSIONS } from "../src/constants/permission.constant";
import { hasPermission } from "../src/utilities/permission.utility";
import { PAYMENT_TERMS } from "../src/constants/payment-terms.constant";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { projectContactService } from "../src/services/project-contact.service";
import { customerContactService } from "../src/services/customer-contact.service";
import { toDialablePhone, toTelephoneHref } from "../src/utilities/phone.utility";
import { saveCustomerContactAction } from "../src/actions/customer-contact.action";
import { saveProjectContactAction } from "../src/actions/contact-directory.action";
import CustomerContacts from "../src/components/CustomerContacts/CustomerContacts";
import { contactDirectoryService } from "../src/services/contact-directory.service";
import { toProjectPayload, toProjectFormValues } from "../src/utilities/project.utility";
import CustomerContactItem from "../src/components/CustomerContacts/CustomerContactItem";
import { CUSTOMER_CONTACT_QUERY_ROOT } from "../src/constants/customer-contact.constant";
import CustomerContactEditor from "../src/components/CustomerContacts/CustomerContactEditor";
import ApartmentLegacyContact from "../src/pages/apartment/components/ApartmentLegacyContact";
import CustomerContactSummary from "../src/components/CustomerContacts/CustomerContactSummary";
import { PROJECT_DETAIL_FIELD_SETS } from "../src/constants/project-detail-field-set.constant";
import { getCustomerImportErrorMessage } from "../src/utilities/customer-import-error.utility";
import { CUSTOMER_IMPORT_ERROR_MESSAGES } from "../src/constants/customer-import-error.constant";
import ApartmentEndCustomerCard from "../src/pages/apartment/components/ApartmentEndCustomerCard";

const contact = {
  id: "contact-1",
  customerId: "customer-1",
  name: "איש קשר ראשון",
  phone: null,
  email: null,
  role: null,
};
const noop = () => {};

test("optional customer contact stays null without dummy values", () => {
  const values = {
    name: "לקוח לבדיקה",
    taxId: "514287937",
    address: "הרצל 12 תל אביב",
    customerType: PROJECT_DETAIL_FIELD_SETS.COMPANY,
    contactName: "",
    phone: "",
    email: "",
  };
  assert.equal(countCustomerFormErrors(values), 0);
  assert.deepEqual(normalizeCustomerForm(values), {
    ...values,
    paymentTerms: null,
    contactName: null,
    phone: null,
    email: null,
  });
  assert.equal(countCustomerFormErrors({ ...values, phone: "+442071838750" }), 1);
  assert.match(
    getCustomerFormErrors({ ...values, phone: "+442071838750" }).contactName ?? "",
    /שם איש קשר/,
  );
  assert.equal(
    countCustomerFormErrors({ ...values, contactName: "נועה", phone: "+442071838750" }),
    0,
  );
});

test("Israeli and international phone inputs use country-coded dial links", () => {
  assert.equal(toDialablePhone("052-1234567"), "+972521234567");
  assert.equal(toDialablePhone("+442071838750"), "+442071838750");
  assert.equal(toTelephoneHref("+442071838750"), "tel:+442071838750");
  assert.equal(toDialablePhone("+44123"), null);
});

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

test("a failed project link retries the created contact without directory edit permission", async () => {
  const originalCreate = contactDirectoryService.create;
  const originalUpdate = contactDirectoryService.update;
  const originalLink = projectContactService.link;
  const calls = { create: 0, update: 0, link: 0, createdContactId: null as string | null };
  contactDirectoryService.create = async () => {
    calls.create += 1;
    return { ...contact, customerId: null };
  };
  contactDirectoryService.update = async () => {
    calls.update += 1;
    throw new Error("directory edit is forbidden");
  };
  projectContactService.link = async projectId => {
    calls.link += 1;
    if (calls.link === 1) {
      throw new Error("temporary link failure");
    }
    return {
      projectId,
      contactId: contact.id,
      role: null,
      isPrimary: true,
      contact: { ...contact, customerId: null },
    };
  };
  const save = () =>
    saveProjectContactAction({
      projectId: "project-1",
      draft: toCustomerContactDraft(contact),
      contactId: null,
      createdContactId: calls.createdContactId,
      isFirstContact: true,
      onContactCreated: id => {
        calls.createdContactId = id;
      },
    });
  try {
    await assert.rejects(save(), /temporary link failure/);
    await save();
    assert.deepEqual(calls, {
      create: 1,
      update: 0,
      link: 2,
      createdContactId: contact.id,
    });
  } finally {
    contactDirectoryService.create = originalCreate;
    contactDirectoryService.update = originalUpdate;
    projectContactService.link = originalLink;
  }
});

test("customer primary label follows the explicit selected contact ID", () => {
  assert.equal(formatCustomerContactCount([]), "0 אנשי קשר");
  assert.equal(formatCustomerContactCount([contact]), "איש קשר אחד");
  const contacts = [contact, { ...contact, id: "contact-2", name: "איש קשר שני" }];
  assert.equal(formatCustomerContactCount(contacts), "2 אנשי קשר");
  assert.equal(formatCustomerPrimaryContact([], null), "אין אנשי קשר נוספים");
  assert.equal(formatCustomerPrimaryContact(contacts, null), "אין אנשי קשר נוספים");
  assert.equal(formatCustomerPrimaryContact(contacts, contact.id), contact.name);
  assert.equal(formatCustomerPrimaryContact(contacts, "contact-2"), "איש קשר שני");
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
  assert.equal(isCustomerContactList([{ ...contact, customerId: null }]), true);
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

test("contact editor accepts English text, landline phone and email with domain-specific validators", () => {
  const values = {
    name: "John Smith",
    role: "Site manager",
    phone: "03-1234567",
    email: "john@example.com",
  };
  assert.deepEqual(getCustomerContactFieldErrors(values), {
    name: null,
    role: null,
    phone: null,
    email: null,
  });
  const markup = renderToStaticMarkup(
    <CustomerContactEditor
      busy={false}
      error={null}
      onSave={noop}
      values={values}
      onCancel={noop}
      onChange={noop}
    />,
  );
  assert.match(markup, /John Smith/);
  assert.match(markup, /Site manager/);
  assert.match(markup, /03-1234567/);
  assert.match(markup, /john@example.com/);
  assert.doesNotMatch(markup, /יש להזין|אינו תקין|אינה תקינה|ארוך מהמותר|עברית| disabled/);
});

test("contact editor allows empty optional fields and reports the correct invalid field", () => {
  const optionalEmpty = { name: "Valid Name", phone: "", email: "", role: "" };
  assert.deepEqual(getCustomerContactFieldErrors(optionalEmpty), {
    name: null,
    role: null,
    phone: null,
    email: null,
  });
  const optionalMarkup = renderToStaticMarkup(
    <CustomerContactEditor
      busy={false}
      error={null}
      onSave={noop}
      onCancel={noop}
      onChange={noop}
      values={optionalEmpty}
    />,
  );
  assert.doesNotMatch(optionalMarkup, /יש להזין|אינו תקין|אינה תקינה|ארוך מהמותר| disabled/);
  const invalid = { name: "א", phone: "bad", email: "invalid", role: "a".repeat(61) };
  assert.deepEqual(getCustomerContactFieldErrors(invalid), {
    name: "יש להזין שם איש קשר תקין",
    phone: "מספר הטלפון אינו תקין",
    email: "כתובת הדוא״ל אינה תקינה",
    role: "התפקיד ארוך מהמותר",
  });
  const markup = renderToStaticMarkup(
    <CustomerContactEditor
      busy={false}
      error={null}
      onSave={noop}
      onCancel={noop}
      onChange={noop}
      values={invalid}
    />,
  );
  assert.match(markup, /יש להזין שם איש קשר תקין/);
  assert.match(markup, /מספר הטלפון אינו תקין/);
  assert.match(markup, /כתובת הדוא״ל אינה תקינה/);
  assert.match(markup, /התפקיד ארוך מהמותר/);
  assert.match(markup, / disabled/);
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

const legacyProject: IApiProject = {
  id: "legacy-project",
  code: "GA-1",
  name: "פרויקט קיים",
  stageId: "stage-1",
  projectTypeId: "type-1",
  customerId: "customer-1",
  updatedAt: "2026-10-30T00:00:00.000Z",
  notes: null,
  priorityId: null,
  driveFolderId: null,
  parentProjectId: null,
  prioritySyncedAt: null,
  address: "רחוב לדוגמה 1, תל אביב",
  addressCity: "תל אביב",
  addressPlaceId: "place-1",
  contactName: "שם היסטורי",
  contactPhone: null,
  contactRole: null,
  customerName: null,
  customerCity: null,
  customerUnit: null,
  customerFloor: null,
  customerPhone: null,
  customerEmail: null,
  customerAddress: null,
  customerApartment: null,
  customerCompanyNumber: null,
  customerAssociationNumber: null,
};

test("new project payload ignores stale contact and payment drafts and retains address", () => {
  const values = {
    ...toProjectFormValues(null),
    name: "פרויקט חדש",
    typeId: legacyProject.projectTypeId,
    customerId: legacyProject.customerId,
    ...toIntakeValues(legacyProject),
    contact: { contactName: "old draft", contactPhone: "0501234567", contactRole: "old role" },
  };
  const payload = toProjectPayload({
    values,
    originalIntake: null,
    fieldSet: PROJECT_DETAIL_FIELD_SETS.PRIVATE_CLIENT,
  });
  assert.ok(payload);
  assert.equal(Reflect.has(payload, "contactName"), false);
  assert.equal(Reflect.has(payload, "contactPhone"), false);
  assert.equal(Reflect.has(payload, "contactRole"), false);
  assert.equal(payload.addressPlaceId, legacyProject.addressPlaceId);
  assert.equal(Reflect.has(payload, "paymentTerms"), false);
  assert.deepEqual(getRequiredIntakeGroups(values, null), { address: true });
});

test("editing a legacy project excludes contact fields even when stale contact values change", () => {
  const original = toIntakeValues(legacyProject);
  const values = {
    ...toProjectFormValues(legacyProject),
    name: "שם חדש לפרויקט",
    paymentTerms: { terms: PAYMENT_TERMS.OTHER, note: "stale" },
    contact: { contactName: "stale changed name", contactPhone: "bad", contactRole: "role" },
  };
  const payload = toProjectPayload({
    values,
    originalIntake: original,
    fieldSet: PROJECT_DETAIL_FIELD_SETS.PRIVATE_CLIENT,
  });
  assert.ok(payload);
  assert.equal(payload.name, values.name);
  assert.equal(payload.customerId, legacyProject.customerId);
  assert.equal(Reflect.has(payload, "paymentTerms"), false);
  assert.equal(Reflect.has(payload, "paymentTermsNote"), false);
  assert.equal(Reflect.has(payload, "contactName"), false);
  assert.equal(Reflect.has(payload, "contactPhone"), false);
  assert.equal(Reflect.has(payload, "contactRole"), false);
  assert.deepEqual(toIntakePayload(original, original), {});
});

test("incomplete legacy project contacts cannot block saving unrelated project edits", () => {
  const values = toIntakeValues(legacyProject);
  assert.equal(Reflect.has(values, "contact"), false);
  assert.equal(
    countIntakeErrors({
      values,
      original: values,
      fieldSet: PROJECT_DETAIL_FIELD_SETS.PRIVATE_CLIENT,
    }),
    0,
  );
  assert.equal(
    countIntakeErrors({
      values: { ...values, address: null },
      original: values,
      fieldSet: PROJECT_DETAIL_FIELD_SETS.PRIVATE_CLIENT,
    }),
    1,
  );
  assert.deepEqual(getRequiredIntakeGroups(createEmptyIntakeValues(), null), {
    address: true,
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

test("contact API codes are localized without reflecting raw server values", () => {
  const config = { headers: new AxiosHeaders() };
  Object.entries(CUSTOMER_IMPORT_ERROR_MESSAGES).forEach(([code, message]) => {
    const error = new AxiosError("failure", "ERR_BAD_REQUEST", config, null, {
      config,
      status: 409,
      statusText: "Conflict",
      headers: {},
      data: { code, message: "private server detail person@example.com" },
    });
    assert.equal(getCustomerImportErrorMessage(error), message);
  });
  ["UNKNOWN_CODE", "toString", "__proto__"].forEach(code => {
    const error = new AxiosError("failure", "ERR_BAD_REQUEST", config, null, {
      config,
      status: 400,
      statusText: "Bad Request",
      headers: {},
      data: { code, message: ["private validation detail"] },
    });
    assert.equal(getCustomerImportErrorMessage(error), "הנתונים שנשלחו אינם תקינים");
  });
  assert.equal(
    getCustomerImportErrorMessage(new Error("private")),
    "הפעולה נכשלה. נסה שוב בעוד רגע.",
  );
});

test("unrecognized contact responses use safe status-specific Hebrew fallbacks", () => {
  const config = { headers: new AxiosHeaders() };
  const cases = [
    { status: 401, message: "פג תוקף החיבור. יש להתחבר מחדש" },
    { status: 403, message: "אין לך הרשאה לבצע פעולה זו" },
    { status: 404, message: "הפריט המבוקש לא נמצא" },
    { status: 409, message: "הפעולה מתנגשת בנתונים קיימים" },
    { status: 500, message: "הפעולה נכשלה. נסה שוב בעוד רגע." },
  ];
  cases.forEach(({ status, message }) => {
    [null, [], "raw", { code: 7 }, { code: null }, { message: "private" }].forEach(data => {
      const error = new AxiosError("failure", "ERR_BAD_RESPONSE", config, null, {
        config,
        status,
        statusText: "Failure",
        headers: {},
        data,
      });
      assert.equal(getCustomerImportErrorMessage(error), message);
    });
  });
});

test("contact summaries preserve callable phone links and email-only fallbacks", () => {
  const phone = "03-1234567";
  const html = renderToStaticMarkup(<CustomerContactSummary contacts={[{ ...contact, phone }]} />);
  assert.match(html, /href="tel:\+97231234567"/);
  assert.match(html, /<bdi>03-1234567<\/bdi>/);
  const emailOnly = renderToStaticMarkup(
    <CustomerContactSummary contacts={[{ ...contact, email: "person@example.com" }]} />,
  );
  assert.match(emailOnly, /person@example.com/);
  assert.doesNotMatch(emailOnly, /href="tel:/);
});

const legacyApartment = {
  ...legacyProject,
  customerId: null,
  customerName: "לקוח קצה היסטורי",
  customerPhone: "031234567",
  contactName: "איש קשר היסטורי",
  contactPhone: "0501234567",
};

test("legacy apartment contact is read-only, callable, and permission gated", () => {
  const markup = renderToStaticMarkup(
    <ApartmentLegacyContact canRead apartment={legacyApartment} />,
  );
  assert.match(markup, /איש קשר היסטורי/);
  assert.match(markup, /href="tel:\+972501234567"/);
  assert.doesNotMatch(markup, /<input|<button/);
  assert.equal(
    renderToStaticMarkup(<ApartmentLegacyContact canRead={false} apartment={legacyApartment} />),
    "",
  );
});

test("linked apartments never fall back to historical contacts, even when association is absent", () => {
  assert.equal(
    renderToStaticMarkup(
      <ApartmentLegacyContact canRead apartment={{ ...legacyApartment, customerId: "linked" }} />,
    ),
    "",
  );
  assert.equal(
    renderToStaticMarkup(
      <ApartmentLegacyContact
        canRead
        apartment={{ ...legacyApartment, contactName: " ", contactPhone: null }}
      />,
    ),
    "",
  );
});

test("unlinked apartment end customer displays only its own historical details", () => {
  const markup = renderToStaticMarkup(
    <ApartmentEndCustomerCard apartment={legacyApartment} building={legacyProject} />,
  );
  assert.match(markup, /לקוח קצה היסטורי/);
  assert.match(markup, /031234567/);
  const empty = renderToStaticMarkup(
    <ApartmentEndCustomerCard
      apartment={{ ...legacyApartment, customerName: null, customerPhone: null }}
      building={legacyProject}
    />,
  );
  assert.match(empty, /לא שויך לקוח קצה לדירה זו/);
});

test("linked apartment customer wins over historical values and missing association does not fallback", () => {
  const apartment = { ...legacyApartment, customerId: "linked" };
  const missing = renderToStaticMarkup(
    <ApartmentEndCustomerCard apartment={apartment} building={legacyProject} />,
  );
  assert.doesNotMatch(missing, /לקוח קצה היסטורי|031234567/);
  const linked = renderToStaticMarkup(
    <ApartmentEndCustomerCard
      apartment={{
        ...apartment,
        customer: { id: "linked", name: "לקוח מקושר", phone: "039999999" },
      }}
      building={legacyProject}
    />,
  );
  assert.match(linked, /לקוח מקושר/);
  assert.match(linked, /039999999/);
  assert.doesNotMatch(linked, /לקוח קצה היסטורי|031234567/);
});
