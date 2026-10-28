import { test } from "node:test";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import Button from "../src/components/Button/Button";
import { setSession } from "../src/store/session.store";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { httpClient } from "../src/services/http-client.service";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CustomerContacts from "../src/components/CustomerContacts/CustomerContacts";
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
    },
  });
  httpClient.defaults.adapter = async () => {
    throw new Error("failed contact save");
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
