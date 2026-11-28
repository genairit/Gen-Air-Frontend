import { test } from "node:test";
import assert from "node:assert/strict";
import { MemoryRouter } from "react-router-dom";
import { act, create } from "react-test-renderer";
import Button from "../src/components/Button/Button";
import { setSession } from "../src/store/session.store";
import { TABS_VARIANTS } from "../src/constants/tabs.constant";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { httpClient } from "../src/services/http-client.service";
import { PERMISSIONS } from "../src/constants/permission.constant";
import InlineError from "../src/components/InlineError/InlineError";
import type { IApiCustomer } from "../src/interfaces/api.interface";
import { MOBILE_LAYOUT_QUERY } from "../src/constants/layout.constant";
import { getApiErrorMessage } from "../src/utilities/api-error.utility";
import { PAYMENT_TERMS } from "../src/constants/payment-terms.constant";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BUILDING_PAGE_COPY } from "../src/constants/apartment.constant";
import { PROJECT_FORM_COPY } from "../src/constants/project-form.constant";
import { CUSTOMER_FORM_COPY } from "../src/constants/customer-form.constant";
import { useStyles as getLayoutStyles } from "../src/layouts/AppLayout.style";
import { useStyles as getTabStyles } from "../src/components/Tabs/Tabs.style";
import CustomerForm from "../src/pages/customer-form/components/CustomerForm";
import { PROJECT_INTAKE_COPY } from "../src/constants/project-intake.constant";
import { PAYMENT_CONFIGURATION_COPY } from "../src/constants/payment-configuration.constant";
import { useStyles as getHeaderStyles } from "../src/components/CardHeader/CardHeader.style";
import CustomerPaymentDefault from "../src/components/CustomerPaymentDefault/CustomerPaymentDefault";
import { useStyles as getDriveStyles } from "../src/pages/project/components/ProjectDriveActions.style";
import PaymentConfigurationEditor from "../src/components/PaymentConfigurationEditor/PaymentConfigurationEditor";

const customer: IApiCustomer = {
  id: "customer-payment",
  name: "לקוח בדיקה",
  taxId: "123456782",
  address: "רחוב בדיקה",
  contactName: "ישראל ישראלי",
  phone: "0501234567",
  email: "payment@example.com",
  customerType: "company",
  paymentTerms: PAYMENT_TERMS.PREPAID,
  priorityId: null,
  prioritySyncedAt: null,
  prioritySyncStatus: "pending",
  prioritySyncAttempts: 0,
  prioritySyncError: null,
  createdAt: "2026-11-23T00:00:00.000Z",
  paymentSchedule: [],
};

test("responsive shell geometry changes together through CSS without a media-query render", () => {
  const styles = getLayoutStyles();
  const mobileQuery = `@media ${MOBILE_LAYOUT_QUERY}`;
  assert.equal(styles.sidebarSlot[mobileQuery].display, "none");
  assert.equal(styles.mobileNavigation.display, "none");
  assert.equal(styles.mobileNavigation[mobileQuery].display, "grid");
  assert.equal(styles.main.padding, "16px 24px 48px");
  assert.match(styles.main[mobileQuery].padding, /112px.*safe-area-inset-bottom/);
  assert.equal(styles.main.minWidth, 0);
});

test("mobile status choices wrap without changing other full-width tab variants", () => {
  const styles = getTabStyles();
  const status = styles.container({ variant: TABS_VARIANTS.STATUS, isFullWidth: true });
  const segmented = styles.container({ variant: TABS_VARIANTS.SEGMENTED, isFullWidth: true });
  assert.ok(status && typeof status === "object");
  assert.ok(segmented && typeof segmented === "object");
  const mobileQuery = `@media ${MOBILE_LAYOUT_QUERY}`;
  assert.deepEqual(Reflect.get(status, mobileQuery), { flexWrap: "wrap" });
  assert.equal(mobileQuery in segmented, false);
  assert.equal(Reflect.get(status, "flexWrap"), "nowrap");
});

test("tab buttons contain projected selection backgrounds while retaining inset focus", () => {
  const styles = getTabStyles();
  for (const variant of Object.values(TABS_VARIANTS)) {
    const tab = styles.tab({ variant, isFullWidth: false });
    assert.ok(tab && typeof tab === "object");
    assert.equal(Reflect.get(tab, "overflow"), "hidden");
    const focusStyle = Reflect.get(tab, "&.Mui-focusVisible");
    assert.ok(focusStyle && typeof focusStyle === "object");
    assert.equal(Reflect.get(focusStyle, "outlineOffset"), -3);
  }
});

test("Drive action stacking is opt-in and action links remain shrinkable", () => {
  const styles = getHeaderStyles();
  const mobileQuery = `@media ${MOBILE_LAYOUT_QUERY}`;
  const stacked = styles.headerLayout({ stackActionsOnMobile: true });
  const regular = styles.headerLayout({ stackActionsOnMobile: false });
  assert.deepEqual(Reflect.get(stacked, mobileQuery), { flexDirection: "column" });
  assert.equal(mobileQuery in regular, false);
  assert.equal(styles.action.maxWidth, "100%");
  const drive = getDriveStyles();
  assert.equal(drive.actions.flexWrap, "wrap");
  assert.equal(drive.link.whiteSpace, "normal");
  assert.equal(drive.link.maxWidth, "100%");
});

test("project and apartment copy never promises retired payment storage or inheritance", () => {
  const projectCopy = [
    PROJECT_INTAKE_COPY.VIEW_TITLE,
    PROJECT_FORM_COPY.DRAFT_PRIVACY,
    BUILDING_PAGE_COPY.EMPTY_DESCRIPTION,
  ];
  for (const text of projectCopy) {
    assert.doesNotMatch(text, /תנאי (?:ה)?תשלום|הערות תשלום/);
  }
  assert.match(BUILDING_PAGE_COPY.EMPTY_DESCRIPTION, /סוג הפרויקט, הכתובת וההערות/);
});

test("customer creation and editing save complete independent payment configurations and preserve failed edits", async () => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const previousWindow = Reflect.get(globalThis, "window");
  const previousDocument = Reflect.get(globalThis, "document");
  Reflect.set(globalThis, "window", Object.assign(new EventTarget(), { setTimeout, clearTimeout }));
  Reflect.set(globalThis, "document", new EventTarget());
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const adapter = httpClient.defaults.adapter;
  const payloads: unknown[] = [];
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  setSession({
    accessToken: "test-token",
    user: {
      id: "test-admin",
      email: "test@example.com",
      phone: "",
      firstName: "Test",
      lastName: "Admin",
      employeeNumber: "",
      deletedAt: null,
      role: USER_ROLES.SYSTEM_ADMIN,
      assignedRoles: [USER_ROLES.SYSTEM_ADMIN],
      permissions: [PERMISSIONS.CUSTOMERS_CREATE, PERMISSIONS.CUSTOMERS_UPDATE],
    },
  });
  httpClient.defaults.adapter = async config => {
    const payload: unknown = JSON.parse(config.data);
    assert.ok(payload !== null && typeof payload === "object" && !Array.isArray(payload));
    payloads.push(payload);
    return {
      data: { ...customer, ...payload },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };
  const custom = { paymentTerms: null, paymentSchedule: [{ percent: "100", text: "מסירה" }] };
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <CustomerForm creatorName="Test" onSaved={() => {}} onCancel={() => {}} />
          </MemoryRouter>
        </QueryClientProvider>,
      );
    });
    const creation = state.renderer;
    assert.ok(creation);
    const createEditor = () => creation.root.findByType(PaymentConfigurationEditor);
    assert.equal(createEditor().props.allowUnset, true);
    assert.deepEqual(createEditor().props.value.paymentSchedule, []);
    assert.equal(createEditor().props.customLabel, PAYMENT_CONFIGURATION_COPY.CUSTOM);
    await act(async () =>
      creation.root.findByProps({ title: CUSTOMER_FORM_COPY.IDENTITY }).props.onChange({
        name: customer.name,
        taxId: customer.taxId,
        address: customer.address,
        phone: customer.phone,
        email: customer.email,
      }),
    );
    await act(async () => createEditor().props.onChange(custom));
    assert.deepEqual(createEditor().props.value.paymentSchedule, custom.paymentSchedule);
    await act(async () => {
      creation.root
        .findAllByType(Button)
        .find(button => button.props.text === CUSTOMER_FORM_COPY.SAVE)
        ?.props.onClick();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.equal(payloads.length, 1, "valid customer creation must reach the API");
    assert.equal(Reflect.get(Object(payloads[0]), "paymentTerms"), null);
    assert.deepEqual(Reflect.get(Object(payloads[0]), "paymentSchedule"), custom.paymentSchedule);
    assert.equal(Reflect.has(Object(payloads[0]), "paymentTermsNote"), false);
    await act(async () => creation.unmount());
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <CustomerPaymentDefault customer={customer} />
        </QueryClientProvider>,
      );
    });
    const editing = state.renderer;
    assert.ok(editing);
    const editEditor = () => editing.root.findByType(PaymentConfigurationEditor);
    const save = () => {
      const result = editing.root
        .findAllByType(Button)
        .find(button => button.props.text === PAYMENT_CONFIGURATION_COPY.SAVE_DEFAULT);
      assert.ok(result);
      return result;
    };
    assert.equal(editEditor().props.value.paymentTerms, PAYMENT_TERMS.PREPAID);
    await act(async () => editEditor().props.onChange({ paymentTerms: null, paymentSchedule: [] }));
    await act(async () => {
      save().props.onClick();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.deepEqual(payloads[1], { paymentTerms: null, paymentSchedule: [] });
    await act(async () =>
      editEditor().props.onChange({
        paymentTerms: null,
        paymentSchedule: [{ percent: "50", text: "מסירה" }],
      }),
    );
    assert.equal(save().props.disabled, true);
    await act(async () => editEditor().props.onChange(custom));
    assert.equal(save().props.disabled, false);
    await act(async () => {
      save().props.onClick();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.deepEqual(payloads[2], custom);
    const saveError = new Error("Payment default could not be saved");
    httpClient.defaults.adapter = async () => {
      throw saveError;
    };
    const failed = {
      paymentTerms: null,
      paymentSchedule: [{ percent: "100", text: "טיוטה שלא נשמרה" }],
    };
    await act(async () => editEditor().props.onChange(failed));
    await act(async () => {
      save().props.onClick();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.equal(editing.root.findByType(InlineError).props.message, getApiErrorMessage(saveError));
    assert.deepEqual(editEditor().props.value, failed);
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    httpClient.defaults.adapter = adapter;
    setSession(null);
    Reflect.set(globalThis, "window", previousWindow);
    Reflect.set(globalThis, "document", previousDocument);
  }
});

test("the client edit form completes unchanged saves without a request and retains a failed draft for retry", async t => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const previousWindow = Reflect.get(globalThis, "window");
  const previousDocument = Reflect.get(globalThis, "document");
  Reflect.set(globalThis, "window", Object.assign(new EventTarget(), { setTimeout, clearTimeout }));
  Reflect.set(globalThis, "document", new EventTarget());
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const savedIds: string[] = [];
  const attempts: unknown[] = [];
  const adapter = httpClient.defaults.adapter;
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  const saveError = new Error("Could not save client");
  const newName = "שם מעודכן";
  t.after(async () => {
    await act(async () => state.renderer?.unmount());
    client.clear();
    httpClient.defaults.adapter = adapter;
    Reflect.set(globalThis, "window", previousWindow);
    Reflect.set(globalThis, "document", previousDocument);
  });
  httpClient.defaults.adapter = async config => {
    assert.equal(config.method, "patch");
    assert.equal(config.url, `/customer/${customer.id}`);
    attempts.push(JSON.parse(config.data));
    if (attempts.length === 1) {
      throw saveError;
    }
    return {
      data: { ...customer, name: newName },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };
  await act(async () => {
    state.renderer = create(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <CustomerForm customer={customer} onCancel={() => {}} onSaved={id => savedIds.push(id)} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });
  const editor = state.renderer;
  assert.ok(editor);
  const identity = () => editor.root.findByProps({ title: CUSTOMER_FORM_COPY.IDENTITY });
  const save = async () => {
    const button = editor.root
      .findAllByType(Button)
      .find(item => item.props.text === CUSTOMER_FORM_COPY.SAVE);
    assert.ok(button);
    await act(async () => {
      button.props.onClick();
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  };

  await save();
  assert.equal(attempts.length, 0);
  assert.deepEqual(savedIds, [customer.id]);

  await act(async () => identity().props.onChange({ name: newName }));
  await save();
  assert.equal(identity().props.values.name, newName);
  assert.deepEqual(savedIds, [customer.id]);
  assert.equal(editor.root.findByType(InlineError).props.message, getApiErrorMessage(saveError));

  await save();
  assert.deepEqual(attempts, [{ name: newName }, { name: newName }]);
  assert.deepEqual(savedIds, [customer.id, customer.id]);
  assert.equal(editor.root.findAllByType(InlineError).length, 0);
});
