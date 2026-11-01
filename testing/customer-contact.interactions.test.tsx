import { test } from "node:test";
import { AxiosError } from "axios";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import Button from "../src/components/Button/Button";
import { setSession } from "../src/store/session.store";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { httpClient } from "../src/services/http-client.service";
import { PERMISSIONS } from "../src/constants/permission.constant";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { customerContactService } from "../src/services/customer-contact.service";
import CustomerContacts from "../src/components/CustomerContacts/CustomerContacts";
import type { ICustomerContact } from "../src/interfaces/customer-contact.interface";
import { CUSTOMER_CONTACT_QUERY_ROOT } from "../src/constants/customer-contact.constant";
import CustomerContactEditor from "../src/components/CustomerContacts/CustomerContactEditor";
import CustomerContactPreview from "../src/components/CustomerContacts/CustomerContactPreview";

const contact = {
  id: "contact-1",
  customerId: "customer-1",
  name: "איש קשר ראשון",
  phone: null,
  email: null,
  role: null,
};

test("failed contact save retains editable draft until successful retry", async () => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
  client.setQueryData([CUSTOMER_CONTACT_QUERY_ROOT, contact.customerId], [contact]);
  const previousAdapter = httpClient.defaults.adapter;
  const rendererState: { current: ReturnType<typeof create> | null } = { current: null };
  setSession({
    accessToken: "test-token",
    user: {
      id: "test-admin",
      email: "test@example.com",
      phone: "",
      lastName: "Test",
      firstName: "Test",
      employeeNumber: "",
      deletedAt: null,
      role: USER_ROLES.SYSTEM_ADMIN,
      permissions: [PERMISSIONS.CUSTOMERS_READ, PERMISSIONS.CUSTOMERS_UPDATE],
    },
  });
  httpClient.defaults.adapter = async config => {
    throw new AxiosError("duplicate", "ERR_BAD_REQUEST", config, null, {
      config,
      status: 409,
      statusText: "Conflict",
      headers: {},
      data: {
        code: "DUPLICATE_CUSTOMER_CONTACT",
        message: "A contact with these details already exists",
      },
    });
  };
  try {
    await act(async () => {
      rendererState.current = create(
        <QueryClientProvider client={client}>
          <CustomerContacts editable customerId={contact.customerId} />
        </QueryClientProvider>,
      );
    });
    const renderer = rendererState.current;
    assert.ok(renderer);
    const add = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === "הוספת איש קשר");
    assert.ok(add);
    await act(async () => add.props.onClick());
    await act(async () =>
      renderer.root
        .findByType(CustomerContactEditor)
        .props.onChange({ name: "איש קשר חדש", role: "", email: "", phone: "" }),
    );
    await act(async () => {
      renderer.root.findByType(CustomerContactEditor).props.onSave();
      await new Promise(resolve => setImmediate(resolve));
    });
    const editor = renderer.root.findByType(CustomerContactEditor);
    assert.equal(editor.props.values.name, "איש קשר חדש");
    assert.equal(editor.props.error, "איש קשר עם פרטים אלה כבר קיים אצל הלקוח");
    httpClient.defaults.adapter = async config => ({
      data: contact,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    });
    await act(async () => {
      editor.props.onSave();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.equal(renderer.root.findAllByType(CustomerContactEditor).length, 0);
  } finally {
    await act(async () => rendererState.current?.unmount());
    httpClient.defaults.adapter = previousAdapter;
    setSession(null);
    client.clear();
  }
});

test("contact read permission gates fetching and rendering while read-only views hide edits", async () => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
  client.setQueryData(
    [CUSTOMER_CONTACT_QUERY_ROOT, contact.customerId],
    [contact, { ...contact, id: "contact-2", name: "איש קשר שני" }],
  );
  const user = {
    id: "test",
    email: "test@example.com",
    phone: "",
    firstName: "Test",
    lastName: "Test",
    employeeNumber: "",
    deletedAt: null,
    role: USER_ROLES.ENGINEER,
    permissions: [PERMISSIONS.CUSTOMERS_READ],
  };
  setSession({ accessToken: "test", user });
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <CustomerContacts customerId={contact.customerId} />
        </QueryClientProvider>,
      );
    });
    assert.ok(state.renderer);
    const output = JSON.stringify(state.renderer.toJSON());
    assert.match(output, /איש קשר ראשון/);
    assert.match(output, /איש קשר שני/);
    assert.doesNotMatch(output, /הוספת איש קשר/);
    await act(async () => {
      setSession({ accessToken: "test", user: { ...user, permissions: [] } });
    });
    assert.equal(state.renderer.toJSON(), null);
    const query = client
      .getQueryCache()
      .find({ queryKey: [CUSTOMER_CONTACT_QUERY_ROOT, contact.customerId] });
    assert.equal(query?.isActive(), false);
  } finally {
    await act(async () => {
      state.renderer?.unmount();
    });
    setSession(null);
    client.clear();
  }
});

test("customer contact preview makes no unauthorized request, then shows pending and read-only contacts", async () => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const getAll = customerContactService.getAll;
  const state: {
    calls: string[];
    renderer: ReturnType<typeof create> | null;
    resolve: ((contacts: ICustomerContact[]) => void) | null;
  } = { calls: [], renderer: null, resolve: null };
  const user = {
    id: "preview-reader",
    email: "test@example.com",
    phone: "",
    firstName: "Test",
    lastName: "Test",
    employeeNumber: "",
    deletedAt: null,
    role: USER_ROLES.ENGINEER,
    permissions: [],
  };
  customerContactService.getAll = async customerId => {
    state.calls.push(customerId);
    return new Promise(resolve => {
      state.resolve = resolve;
    });
  };
  setSession({ accessToken: "test", user });
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <CustomerContactPreview customerId={contact.customerId} />
        </QueryClientProvider>,
      );
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    assert.equal(renderer.toJSON(), null);
    assert.deepEqual(state.calls, []);
    assert.equal(
      client
        .getQueryCache()
        .find({
          queryKey: [CUSTOMER_CONTACT_QUERY_ROOT, contact.customerId],
        })
        ?.isActive(),
      false,
    );
    await act(async () => {
      setSession({
        accessToken: "test",
        user: { ...user, permissions: [PERMISSIONS.CUSTOMERS_READ] },
      });
    });
    assert.deepEqual(state.calls, [contact.customerId]);
    assert.equal(
      renderer.root.findByProps({ role: "status" }).children.join(""),
      "טוען אנשי קשר...",
    );
    assert.equal(renderer.root.findAllByType(CustomerContactEditor).length, 0);
    const resolve = state.resolve;
    assert.ok(resolve);
    await act(async () => {
      resolve([{ ...contact, phone: "0501234567", role: "מהנדס" }]);
      await client.getQueryCache().find({
        queryKey: [CUSTOMER_CONTACT_QUERY_ROOT, contact.customerId],
      })?.promise;
      await new Promise(finish => setTimeout(finish, 0));
    });
    const output = JSON.stringify(renderer.toJSON());
    assert.match(output, /איש קשר ראשון/);
    assert.match(output, /0501234567/);
    assert.match(output, /מהנדס/);
    assert.doesNotMatch(output, /טוען אנשי קשר|הוספת איש קשר|פרטי איש קשר/);
    assert.equal(renderer.root.findAllByType(Button).length, 0);
    assert.equal(renderer.root.findAllByType(CustomerContactEditor).length, 0);
    assert.deepEqual(state.calls, [contact.customerId]);
  } finally {
    await act(async () => state.renderer?.unmount());
    customerContactService.getAll = getAll;
    setSession(null);
    client.clear();
  }
});

test("customer contact preview shows safe errors and retries into a read-only success", async () => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const getAll = customerContactService.getAll;
  const state: { calls: string[]; renderer: ReturnType<typeof create> | null } = {
    calls: [],
    renderer: null,
  };
  setSession({
    accessToken: "test",
    user: {
      id: "preview-reader",
      email: "test@example.com",
      phone: "",
      firstName: "Test",
      lastName: "Test",
      employeeNumber: "",
      deletedAt: null,
      role: USER_ROLES.ENGINEER,
      permissions: [PERMISSIONS.CUSTOMERS_READ],
    },
  });
  customerContactService.getAll = async customerId => {
    state.calls.push(customerId);
    throw new Error("private upstream detail");
  };
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <CustomerContactPreview customerId={contact.customerId} />
        </QueryClientProvider>,
      );
      await new Promise(finish => setTimeout(finish, 0));
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    await act(async () => {
      await new Promise(finish => setTimeout(finish, 0));
    });
    const failedOutput = JSON.stringify(renderer.toJSON());
    assert.match(failedOutput, /הפעולה נכשלה. נסה שוב בעוד רגע./);
    assert.doesNotMatch(failedOutput, /private upstream detail|איש קשר ראשון/);
    assert.deepEqual(state.calls, [contact.customerId]);
    const retry = renderer.root.findByType(Button);
    assert.equal(retry.props.text, "נסה שוב");
    customerContactService.getAll = async customerId => {
      state.calls.push(customerId);
      return [contact];
    };
    await act(async () => {
      await retry.props.onClick();
      await new Promise(finish => setTimeout(finish, 0));
    });
    const output = JSON.stringify(renderer.toJSON());
    assert.match(output, /איש קשר ראשון/);
    assert.doesNotMatch(output, /הפעולה נכשלה|נסה שוב|הוספת איש קשר|פרטי איש קשר/);
    assert.equal(renderer.root.findAllByType(CustomerContactEditor).length, 0);
    assert.equal(renderer.root.findAllByType(Button).length, 0);
    assert.deepEqual(state.calls, [contact.customerId, contact.customerId]);
  } finally {
    await act(async () => state.renderer?.unmount());
    customerContactService.getAll = getAll;
    setSession(null);
    client.clear();
  }
});
