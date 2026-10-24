import ts from "typescript";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";

registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "moment/dist/locale/he") {
      return next("moment/locale/he.js", context);
    }

    if (specifier.startsWith(".") && context.parentURL) {
      const matchingUrl = [".ts", "/index.ts"]
        .map(suffix => new URL(specifier + suffix, context.parentURL))
        .find(url => existsSync(url));
      if (matchingUrl) {
        return { url: matchingUrl.href, shortCircuit: true };
      }
    }

    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".ts")) {
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(
          readFileSync(fileURLToPath(url), "utf8").replaceAll("import.meta.env", "({})"),
          {
            compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
          },
        ).outputText,
      };
    }

    return next(url, context);
  },
});

const utility = await import("../src/utilities/apartment.utility.ts");
const { isApiProject } = await import("../src/utilities/guards/api.guard.ts");
const { validateApartmentNumber } =
  await import("../src/utilities/validators/apartment-number.validator.ts");
const { EMPTY_APARTMENT_FORM } = await import("../src/constants/apartment.constant.ts");
const { PAYMENT_TERMS } = await import("../src/constants/payment-terms.constant.ts");

const FORM = {
  ...EMPTY_APARTMENT_FORM,
  floor: "0",
  apartmentNumber: "24א",
  customerId: "customer-1",
};

const USER = {
  id: "engineer-1",
  email: "engineer@example.test",
  phone: "0501234567",
  firstName: "ישראל",
  lastName: "ישראלי",
  employeeNumber: "101",
  role: "engineer",
  deletedAt: null,
};
const MEMBER = { id: "member-1", userId: USER.id, role: USER.role, user: USER };
const PROJECT = {
  id: "apartment-1",
  code: "GA-24",
  name: "דירה 24",
  stageId: "stage-1",
  projectTypeId: "type-1",
  updatedAt: "2026-10-24T10:00:00.000Z",
  parentProjectId: "building-1",
  customerId: "customer-1",
  notes: null,
  customerName: "לקוח דירה",
  customerCity: null,
  customerUnit: null,
  customerFloor: 0,
  customerPhone: "0501234567",
  customerEmail: null,
  customerAddress: null,
  customerApartment: "24א",
  customerCompanyNumber: null,
  customerAssociationNumber: null,
  address: "רחוב ראשון 1",
  contactName: "איש קשר",
  contactRole: null,
  addressCity: null,
  contactPhone: "0501234567",
  addressPlaceId: null,
  paymentTermsNote: null,
  paymentTerms: null,
};

test("creating an apartment links its selected customer and omits inherited overrides", () => {
  assert.deepEqual(utility.toApartmentPayload(FORM), {
    customerId: "customer-1",
    customerFloor: 0,
    customerApartment: "24א",
  });
});

test("apartment payload trims the number, preserves basement floors and removes free-text contacts", () => {
  const payload = utility.toApartmentPayload({
    ...FORM,
    floor: "-1",
    apartmentNumber: " 24א ",
    customerName: "legacy name",
    customerPhone: "0501234567",
    contactName: "legacy contact",
    contactPhone: "0507654321",
  });
  assert.equal(payload.customerFloor, -1);
  assert.equal(payload.customerApartment, "24א");
  assert.deepEqual(Object.keys(payload).sort(), [
    "customerApartment",
    "customerFloor",
    "customerId",
  ]);
});

test("an intentionally empty apartment team sends an explicit empty array", () => {
  assert.deepEqual(utility.toApartmentPayload({ ...FORM, members: [] }).members, []);
  assert.equal("members" in utility.toApartmentPayload({ ...FORM, members: null }), false);
});

test("own-team payload sends assignments only, without relation ids or employee objects", () => {
  const snapshot = structuredClone(MEMBER);
  assert.deepEqual(utility.toApartmentPayload({ ...FORM, members: [MEMBER] }).members, [
    { userId: USER.id, role: "engineer" },
  ]);
  assert.deepEqual(MEMBER, snapshot);
});

test("a creation-time payment override trims custom notes", () => {
  const payload = utility.toApartmentPayload({
    ...FORM,
    paymentTerms: PAYMENT_TERMS.OTHER,
    paymentTermsNote: "  תשלום בהתאם להסכם הפרויקט  ",
  });
  assert.equal(payload.paymentTerms, "other");
  assert.equal(payload.paymentTermsNote, "תשלום בהתאם להסכם הפרויקט");
});

test("standard terms clear stale custom notes and resetting terms omits the entire override", () => {
  const standard = utility.toApartmentPayload({
    ...FORM,
    paymentTerms: PAYMENT_TERMS.MILESTONES_NET_60,
    paymentTermsNote: "stale custom note",
  });
  assert.equal(standard.paymentTermsNote, null);
  const inherited = utility.toApartmentPayload({ ...FORM, paymentTermsNote: "stale note" });
  assert.equal("paymentTerms" in inherited, false);
  assert.equal("paymentTermsNote" in inherited, false);
});

test("validation counts the two required unit fields and the required customer", () => {
  assert.equal(utility.countInvalidApartmentFields(EMPTY_APARTMENT_FORM), 3);
  assert.equal(utility.countInvalidApartmentFields(FORM), 0);
  assert.equal(utility.countInvalidApartmentFields({ ...FORM, customerId: null }), 1);
  assert.equal(
    utility.countInvalidApartmentFields({ ...FORM, floor: "wrong", apartmentNumber: "24ab" }),
    2,
  );
});

test("custom payment notes participate in the validation count only for an override", () => {
  assert.equal(
    utility.countInvalidApartmentFields({ ...FORM, paymentTerms: PAYMENT_TERMS.OTHER }),
    1,
  );
  assert.equal(
    utility.countInvalidApartmentFields({
      ...FORM,
      paymentTerms: PAYMENT_TERMS.OTHER,
      paymentTermsNote: " קצר ",
    }),
    1,
  );
  assert.equal(
    utility.countInvalidApartmentFields({
      ...FORM,
      paymentTerms: PAYMENT_TERMS.OTHER,
      paymentTermsNote: "תנאי תשלום מוסכמים",
    }),
    0,
  );
  assert.equal(utility.countInvalidApartmentFields({ ...FORM, paymentTermsNote: "" }), 0);
});

test("zero and basement floors are valid while fractions and values outside server bounds fail", () => {
  for (const floor of ["0", "-1", "-999", "999"]) {
    assert.equal(utility.countInvalidApartmentFields({ ...FORM, floor }), 0, floor);
  }
  for (const floor of ["1.5", "1000", "-1000", "", "floor 1"]) {
    assert.equal(utility.countInvalidApartmentFields({ ...FORM, floor }), 1, floor);
  }
});

test("apartment numbers allow digits with one optional Hebrew letter up to the server's ten-character limit", () => {
  for (const number of ["24", "24א", " 24א ", "1234567890", "123456789א", "0"]) {
    assert.equal(validateApartmentNumber(number).isValid, true, number);
  }
  for (const number of [
    "",
    " ",
    "א24",
    "24אא",
    "24a",
    "-24",
    "24.1",
    "24/1",
    "12345678901",
    "1234567890א",
  ]) {
    assert.equal(validateApartmentNumber(number).isValid, false, number);
  }
});

test("team candidates exclude inactive employees and roles which cannot join a project", () => {
  const candidates = utility.getApartmentTeamCandidates(
    [
      USER,
      { ...USER, id: "deleted", deletedAt: "2026-10-24T10:00:00.000Z" },
      { ...USER, id: "admin", role: "system_admin" },
      { ...USER, id: "finance", role: "finance" },
      { ...USER, id: "installer", role: "installer" },
    ],
    [],
  );
  assert.deepEqual(
    candidates.map(user => user.id),
    ["engineer-1", "installer"],
  );
});

test("each team role stays unique until its existing member is removed", () => {
  const users = [
    USER,
    { ...USER, id: "engineer-2" },
    { ...USER, id: "manager", role: "project_manager" },
  ];
  assert.deepEqual(
    utility.getApartmentTeamCandidates(users, [MEMBER]).map(user => user.id),
    ["manager"],
  );
  assert.deepEqual(
    utility.getApartmentTeamCandidates(users, []).map(user => user.id),
    ["engineer-1", "engineer-2", "manager"],
  );
});

test("parent-customer explanation names the linked parent customer before any legacy field", () => {
  const note = utility.formatParentCustomerNote({
    customer: { name: "בעלים מקושר" },
    customerName: "שם ישן",
  });
  assert.equal(note, "לקוח הפרויקט האב: בעלים מקושר. הוא אינו לקוח הקצה של הדירה ואינו עובר אליה.");
  assert.match(
    utility.formatParentCustomerNote({ customer: null, customerName: "בעלים ישן" }),
    /בעלים ישן/,
  );
  assert.match(
    utility.formatParentCustomerNote({ customer: null, customerName: null }),
    /לא שויך לקוח/,
  );
});

test("legacy apartments keep readable free-text names and no-customer fallback", () => {
  assert.equal(utility.formatEndCustomer({ customerName: "דייר ותיק" }), "דייר ותיק");
  assert.equal(utility.formatEndCustomer({ customerName: null }), "ללא לקוח קצה");
});

test("the invalid-field banner uses the design's creation-specific copy", () => {
  assert.equal(utility.formatApartmentValidationCount(3), "יש 3 שדות לתיקון לפני ההוספה");
});

test("the project guard accepts inherited/own team flags and older responses without the flag", () => {
  assert.equal(isApiProject(PROJECT), true);
  assert.equal(isApiProject({ ...PROJECT, hasOwnTeam: false }), true);
  assert.equal(isApiProject({ ...PROJECT, hasOwnTeam: true, members: [MEMBER] }), true);
  for (const hasOwnTeam of ["true", "false", 1, 0, {}, []]) {
    assert.equal(isApiProject({ ...PROJECT, hasOwnTeam }), false, JSON.stringify(hasOwnTeam));
  }
});
