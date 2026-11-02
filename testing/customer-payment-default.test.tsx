import {
  PAYMENT_TERMS,
  PAYMENT_TERMS_LABELS,
  CUSTOMER_PAYMENT_DEFAULT_COPY,
} from "../src/constants/payment-terms.constant";

import { test } from "node:test";
import assert from "node:assert/strict";
import { MemoryRouter } from "react-router-dom";
import { act, create } from "react-test-renderer";
import Button from "../src/components/Button/Button";
import { setSession } from "../src/store/session.store";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { httpClient } from "../src/services/http-client.service";
import { PERMISSIONS } from "../src/constants/permission.constant";
import type { IApiCustomer } from "../src/interfaces/api.interface";
import Autocomplete from "../src/components/Autocomplete/Autocomplete";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CUSTOMER_FORM_COPY } from "../src/constants/customer-form.constant";
import NewCustomerForm from "../src/pages/customer-form/components/NewCustomerForm";
import CustomerFieldsCard from "../src/pages/customer-form/components/CustomerFieldsCard";
import CustomerPaymentDefault from "../src/components/CustomerPaymentDefault/CustomerPaymentDefault";

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
  createdById: "test-admin",
};

test("customer creation and editing select a default and explicitly clear it to null", async () => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const previousWindow = Reflect.get(globalThis, "window");
  const previousDocument = Reflect.get(globalThis, "document");
  Reflect.set(globalThis, "window", Object.assign(new EventTarget(), { setTimeout, clearTimeout }));
  Reflect.set(globalThis, "document", new EventTarget());
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
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
      permissions: [PERMISSIONS.CUSTOMERS_CREATE, PERMISSIONS.CUSTOMERS_UPDATE],
    },
  });
  httpClient.defaults.adapter = async config => {
    const payload: unknown = JSON.parse(config.data);
    payloads.push(payload);
    return { data: customer, status: 200, statusText: "OK", headers: {}, config };
  };
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <NewCustomerForm creatorName="Test" />
          </MemoryRouter>
        </QueryClientProvider>,
      );
    });
    const creation = state.renderer;
    assert.ok(creation);
    const createSelector = () =>
      creation.root
        .findAllByType(Autocomplete)
        .find(control => control.props.title === "תנאי תשלום כברירת מחדל");
    const initialSelector = createSelector();
    assert.ok(initialSelector);
    assert.ok(initialSelector.props.options.includes(CUSTOMER_PAYMENT_DEFAULT_COPY.NONE));
    assert.equal(initialSelector.props.value, CUSTOMER_PAYMENT_DEFAULT_COPY.NONE);
    await act(async () =>
      creation.root.findAllByType(CustomerFieldsCard)[0].props.onChange({
        name: customer.name,
        taxId: customer.taxId,
        address: customer.address,
        contactName: customer.contactName,
        phone: customer.phone,
        email: customer.email,
      }),
    );
    await act(async () =>
      initialSelector.props.onChange(PAYMENT_TERMS_LABELS[PAYMENT_TERMS.PREPAID].title),
    );
    assert.equal(createSelector()?.props.value, PAYMENT_TERMS_LABELS[PAYMENT_TERMS.PREPAID].title);
    await act(async () => createSelector()?.props.onChange(CUSTOMER_PAYMENT_DEFAULT_COPY.NONE));
    await act(async () => {
      creation.root
        .findAllByType(Button)
        .find(button => button.props.text === CUSTOMER_FORM_COPY.SAVE)
        ?.props.onClick();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.ok(payloads.length === 1, "valid customer creation must reach the API");
    assert.equal(Reflect.get(Object(payloads[0]), "paymentTerms"), null);
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
    const editSelector = () => editing.root.findByType(Autocomplete);
    assert.equal(editSelector().props.value, PAYMENT_TERMS_LABELS[PAYMENT_TERMS.PREPAID].title);
    await act(async () => editSelector().props.onChange(CUSTOMER_PAYMENT_DEFAULT_COPY.NONE));
    assert.equal(editSelector().props.value, CUSTOMER_PAYMENT_DEFAULT_COPY.NONE);
    await act(async () => {
      editing.root.findByType(Button).props.onClick();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.deepEqual(payloads[1], { paymentTerms: null });
    await act(async () =>
      editSelector().props.onChange(PAYMENT_TERMS_LABELS[PAYMENT_TERMS.PREPAID].title),
    );
    await act(async () => {
      editing.root.findByType(Button).props.onClick();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.deepEqual(payloads[2], { paymentTerms: PAYMENT_TERMS.PREPAID });
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    httpClient.defaults.adapter = adapter;
    setSession(null);
    Reflect.set(globalThis, "window", previousWindow);
    Reflect.set(globalThis, "document", previousDocument);
  }
});
