import { test, mock } from "node:test";
import assert from "node:assert/strict";
import type { ComponentProps } from "react";
import { act, create } from "react-test-renderer";
import { quotationFixture } from "./quotation.fixture";
import { setSession } from "../src/store/session.store";
import CheckBox from "../src/components/CheckBox/CheckBox";
import SharedButton from "../src/components/Button/Button";
import { setTimeout as settle } from "node:timers/promises";
import ChoiceRow from "../src/components/ChoiceRow/ChoiceRow";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { PERMISSIONS } from "../src/constants/permission.constant";
import { customerService } from "../src/services/customer.service";
import InlineError from "../src/components/InlineError/InlineError";
import { quotationService } from "../src/services/quotation.service";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { getActiveNavigationId } from "../src/utilities/route.utility";
import { QUOTATION_SYSTEM } from "../src/constants/quotation.constant";
import GenericPopup from "../src/components/GenericPopup/GenericPopup";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QUOTATION_DETAIL_KEY } from "../src/constants/quotation.constant";
import { QUOTATION_AUTOSAVE_MS } from "../src/constants/quotation.constant";
import QuotationInput from "../src/pages/quotations/components/QuotationInput";
import QuotationSelect from "../src/pages/quotations/components/QuotationSelect";
import { QUOTATION_SALES_AGENTS_KEY } from "../src/constants/quotation.constant";
import QuotationDelete from "../src/pages/quotations/components/QuotationDelete";
import QuotationButton from "../src/pages/quotations/components/QuotationButton";
import QuotationEditor from "../src/pages/quotations/components/QuotationEditor";
import QuotationSection from "../src/pages/quotations/components/QuotationSection";
import QuotationSummary from "../src/pages/quotations/components/QuotationSummary";
import QuotationWorkspace from "../src/pages/quotations/components/QuotationWorkspace";
import type { IQuotation, IQuotationLine } from "../src/interfaces/quotation.interface";
import QuotationDecimalInput from "../src/pages/quotations/components/QuotationDecimalInput";
import QuotationProjectPicker from "../src/pages/quotations/components/QuotationProjectPicker";
import QuotationCustomerPicker from "../src/pages/quotations/components/QuotationCustomerPicker";
import ValidationMessageText from "../src/components/ValidationMessageText/ValidationMessageText";
import QuotationCataloguePicker from "../src/pages/quotations/components/QuotationCataloguePicker";
import QuotationSalesAgentPicker from "../src/pages/quotations/components/QuotationSalesAgentPicker";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
Reflect.set(globalThis, "window", new EventTarget());
const salesAgentTestUserId = "quotation-agent-test-user";
const setSalesAgentTestSession = (
  permissions = [PERMISSIONS.QUOTATIONS_READ, PERMISSIONS.EMPLOYEES_READ],
) =>
  setSession({
    accessToken: "quotation-agent-test-token",
    user: {
      id: salesAgentTestUserId,
      email: "agent-test@example.invalid",
      phone: "0500000000",
      firstName: "Agent",
      lastName: "Test",
      role: USER_ROLES.SYSTEM_ADMIN,
      assignedRoles: [USER_ROLES.SYSTEM_ADMIN],
      employeeNumber: "TEST-1",
      deletedAt: null,
      permissions,
    },
  });
const salesAgentTestQueryKey = [...QUOTATION_SALES_AGENTS_KEY, salesAgentTestUserId];
test("one table shows sections from both companies and the quotation-wide General group", async () => {
  const base = quotationFixture();
  base.brands = ["אלקטרה", "תדיראן"];
  base.sections = [
    { id: "alpha", title: "אלפא", systemType: "VRF", brand: "אלקטרה", items: [] },
    { id: "beta", title: "בטא", systemType: "VRF", brand: "תדיראן", items: [] },
    { id: "general", title: "כללי", systemType: QUOTATION_SYSTEM.GENERAL, brand: null, items: [] },
  ];
  const customers = mock.method(customerService, "getByFilter", async () => []);
  const customer = mock.method(customerService, "getById", async () => ({
    id: base.customerId,
    name: "Customer",
  }));
  const projects = mock.method(quotationService, "projectChoices", async () => []);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const router = createMemoryRouter([
    {
      path: "/",
      element: (
        <QueryClientProvider client={client}>
          <QuotationEditor editable canApprove initial={base} />
        </QueryClientProvider>
      ),
    },
  ]);
  const state = { renderer: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      state.renderer = create(<RouterProvider router={router} />);
    });
    const sections = () =>
      state.renderer!.root.findAllByType(QuotationSection).map(node => node.props.section.id);
    assert.deepEqual(sections(), ["alpha", "beta", "general"]);
    const table = state.renderer!.root.findByProps({ "aria-label": "פריטי ההצעה" });
    const sectionNodes = table.findAllByType(QuotationSection);
    for (const [index, brand] of ["אלקטרה", "תדיראן", ""].entries()) {
      const trigger = sectionNodes[index].find(
        node => node.type === "button" && node.children.includes("+ הוסף פריט מהקטלוג"),
      );
      await act(() => trigger.props.onClick());
      assert.equal(sectionNodes[index].findByType(QuotationCataloguePicker).props.brand, brand);
    }
  } finally {
    await act(async () => {
      state.renderer?.unmount();
    });
    client.clear();
    router.dispose();
    customers.mock.restore();
    customer.mock.restore();
    projects.mock.restore();
  }
});
for (const [initialStatus, nextStatus, expectedReviews] of [
  ["draft", "review", 1],
  ["review", "draft", 0],
  ["approved", "draft", 0],
] as const) {
  test(`${initialStatus} to ${nextStatus} selects the appropriate view without reload`, async () => {
    const base = { ...quotationFixture(), status: initialStatus };
    const transition = mock.method(quotationService, "transition", async () => ({
      ...base,
      status: nextStatus,
      version: 2,
    }));
    const customers = mock.method(customerService, "getByFilter", async () => []);
    const customer = mock.method(customerService, "getById", async () => ({
      id: base.customerId,
      name: "Customer",
    }));
    const projects = mock.method(quotationService, "projectChoices", async () => []);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    const router = createMemoryRouter([
      {
        path: "/",
        element: (
          <QueryClientProvider client={client}>
            <QuotationEditor editable canApprove initial={base} />
          </QueryClientProvider>
        ),
      },
    ]);
    const state = { renderer: null as ReturnType<typeof create> | null };
    try {
      await act(async () => {
        state.renderer = create(<RouterProvider router={router} />);
      });
      const summary = state.renderer!.root.findByType(QuotationSummary);
      await act(() => summary.props.onTransition(nextStatus));
      assert.equal(transition.mock.callCount(), 1);
      assert.equal(
        Number(state.renderer!.root.findByType(QuotationWorkspace).props.readOnly),
        expectedReviews,
      );
    } finally {
      await act(async () => state.renderer?.unmount());
      client.clear();
      router.dispose();
      transition.mock.restore();
      customers.mock.restore();
      customer.mock.restore();
      projects.mock.restore();
    }
  });
}
test("quotation list highlights quotation navigation", () => {
  assert.equal(getActiveNavigationId("/quotations"), "/quotations");
});

test("unsaved edits block navigation until the server accepts the save", async () => {
  const base = quotationFixture();
  const gate = Promise.withResolvers<IQuotation>();
  const save = mock.method(quotationService, "save", () => gate.promise);
  const customers = mock.method(customerService, "getByFilter", async () => []);
  const customer = mock.method(customerService, "getById", async () => ({
    id: base.customerId,
    name: "Customer",
  }));
  const projects = mock.method(quotationService, "projectChoices", async () => []);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const router = createMemoryRouter([
    {
      path: "/",
      element: (
        <QueryClientProvider client={client}>
          <QuotationEditor editable canApprove initial={base} />
        </QueryClientProvider>
      ),
    },
    { path: "/away", element: <p>Away</p> },
  ]);
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  try {
    await act(async () => {
      state.renderer = create(<RouterProvider router={router} />);
    });
    const summary = state.renderer?.root.findByType(QuotationSummary);
    assert.ok(summary);
    await act(async () => {
      summary.props.onChange({ ...base, internalNotes: "unsaved" });
    });
    await act(async () => {
      await router.navigate("/away");
    });
    assert.equal(router.state.location.pathname, "/");
    assert.equal(
      [...router.state.blockers.values()].some(blocker => blocker.state === "blocked"),
      true,
    );
    await act(async () => {
      await settle(QUOTATION_AUTOSAVE_MS + 30);
    });
    assert.equal(save.mock.callCount(), 1);
    assert.equal(router.state.location.pathname, "/");
    await act(async () => {
      gate.resolve({ ...base, version: 2, internalNotes: "unsaved" });
    });
    assert.equal(router.state.location.pathname, "/away");
  } finally {
    await act(async () => {
      state.renderer?.unmount();
    });
    client.clear();
    router.dispose();
    save.mock.restore();
    customers.mock.restore();
    customer.mock.restore();
    projects.mock.restore();
  }
});

test("autosave keeps quotation fields and catalogue picker mounted and editable", async () => {
  const { catalogueLine } = await import("../src/utilities/quotation.utility");
  const { catalogueFixture } = await import("./quotation.fixture");
  const base = quotationFixture();
  base.sections = [
    {
      id: "section",
      title: "קומה 1",
      systemType: "VRF",
      brand: "אלקטרה",
      items: [catalogueLine(catalogueFixture(), null)],
    },
  ];
  const gate = Promise.withResolvers<IQuotation>();
  const save = mock.method(quotationService, "save", () => gate.promise);
  const customers = mock.method(customerService, "getByFilter", async () => []);
  const customer = mock.method(customerService, "getById", async () => ({
    id: base.customerId,
    name: "Customer",
  }));
  const projects = mock.method(quotationService, "projectChoices", async () => []);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const router = createMemoryRouter([
    {
      path: "/",
      element: (
        <QueryClientProvider client={client}>
          <QuotationEditor editable canApprove initial={base} />
        </QueryClientProvider>
      ),
    },
  ]);
  const state = { renderer: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      state.renderer = create(<RouterProvider router={router} />);
    });
    const root = () => state.renderer!.root;
    await act(() =>
      root()
        .find(node => node.type === "button" && node.children.includes("+ הוסף פריט מהקטלוג"))
        .props.onClick(),
    );
    await act(() =>
      root()
        .findByProps({ "aria-label": `עריכת פריט ${base.sections[0].items[0].description}` })
        .props.onClick(),
    );
    const location = () => root().findByProps({ "aria-label": "מיקום" });
    const quantityToAdd = () => root().findByProps({ "aria-label": "כמות להוספה" });
    await act(() => quantityToAdd().props.onChange({ target: { value: "3" } }));
    await act(() => location().props.onChange({ target: { value: "חדר שינה" } }));
    await act(async () => {
      await settle(QUOTATION_AUTOSAVE_MS + 30);
    });
    assert.equal(save.mock.callCount(), 1);
    assert.equal(root().findByType(QuotationSection).props.disabled, false);
    assert.equal(root().findAllByType(QuotationCataloguePicker).length, 1);
    assert.equal(quantityToAdd().props.value, "3");
    assert.equal(location().props.disabled, false);
    assert.equal(location().props.value, "חדר שינה");
    await act(() =>
      root()
        .findByProps({ "aria-label": "חברת מיזוג" })
        .props.onChange({ target: { value: "תדיראן" } }),
    );
    const confirmBrand = () =>
      root()
        .findAllByType(QuotationButton)
        .find(button => button.props.text === "החלף לפריטים תואמים");
    assert.equal(confirmBrand()?.props.disabled, true);
    await act(async () => {
      gate.resolve({
        ...base,
        version: 2,
        sections: [
          { ...base.sections[0], items: [{ ...base.sections[0].items[0], location: "חדר שינה" }] },
        ],
      });
    });
    assert.equal(confirmBrand()?.props.disabled, false);
  } finally {
    await act(async () => state.renderer?.unmount());
    router.dispose();
    client.clear();
    save.mock.restore();
    customers.mock.restore();
    customer.mock.restore();
    projects.mock.restore();
  }
});

test("review edit, reopen and resubmit resets the explicit edit view", async () => {
  const base = { ...quotationFixture(), status: "review" as const };
  const transition = mock.method(quotationService, "transition", async (quote, status) => ({
    ...quote,
    status,
    version: quote.version + 1,
  }));
  const customers = mock.method(customerService, "getByFilter", async () => []);
  const customer = mock.method(customerService, "getById", async () => ({
    id: base.customerId,
    name: "Customer",
  }));
  const projects = mock.method(quotationService, "projectChoices", async () => []);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const router = createMemoryRouter([
    {
      path: "/",
      element: (
        <QueryClientProvider client={client}>
          <QuotationEditor editable canApprove initial={base} />
        </QueryClientProvider>
      ),
    },
  ]);
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  const root = () => {
    assert.ok(state.renderer);
    return state.renderer.root;
  };
  try {
    await act(async () => {
      state.renderer = create(<RouterProvider router={router} />);
    });
    await act(async () => {
      root()
        .findAllByType(QuotationButton)
        .find(button => button.props.text === "עריכה")!
        .props.onClick();
    });
    assert.equal(root().findByType(QuotationWorkspace).props.readOnly, false);
    await act(() => root().findByType(QuotationSummary).props.onTransition("draft"));
    assert.equal(root().findByType(QuotationWorkspace).props.readOnly, false);
    await act(() => root().findByType(QuotationSummary).props.onTransition("review"));
    assert.equal(transition.mock.callCount(), 2);
    assert.equal(root().findByType(QuotationWorkspace).props.readOnly, true);
    assert.equal(root().findByType(QuotationSummary).props.quotation.version, 3);
  } finally {
    await act(async () => {
      state.renderer?.unmount();
    });
    client.clear();
    router.dispose();
    transition.mock.restore();
    customers.mock.restore();
    customer.mock.restore();
    projects.mock.restore();
  }
});

test("payment stages resolve conflicting terms and fixed terms require confirmation", async () => {
  const { default: QuotationPayments } =
    await import("../src/pages/quotations/components/QuotationPayments");
  const quotation = {
    ...quotationFixture(),
    paymentSchedule: [{ percent: "35", text: "הזמנה" }],
    paymentTermsNote: "preserve",
  };
  const updates: IQuotation[] = [];
  const renderer = { value: null as ReturnType<typeof create> | null };
  const show = async (value: IQuotation, disabled = false) => {
    await act(async () => {
      renderer.value!.update(
        <QuotationPayments
          quotation={value}
          disabled={disabled}
          onChange={next => updates.push(next)}
        />,
      );
    });
  };
  try {
    await act(async () => {
      renderer.value = create(
        <QuotationPayments
          disabled={false}
          quotation={quotation}
          onChange={next => updates.push(next)}
        />,
      );
    });
    const root = () => renderer.value!.root;
    const group = root().findByProps({ role: "radiogroup" });
    assert.equal(group.props["aria-label"], "תנאי תשלום");
    const radios = () => root().findAllByType(ChoiceRow);
    const radio = (label: string) => {
      const choice = radios().find(current => current.props.children === label);
      assert.ok(choice, `Missing payment choice: ${label}`);
      return choice;
    };
    const stages = () => radio("לפי שלבי תשלום");
    const prepaid = () => radio("תשלום מראש");
    assert.equal(radios().filter(radio => radio.props["aria-checked"]).length, 0);
    assert.equal(root().findAllByType(InlineError).length, 1);
    await act(async () => {
      stages().props.onClick();
    });
    assert.equal(updates.length, 1);
    assert.equal(updates[0].paymentTerms, null);
    assert.equal(updates[0].paymentSchedule, quotation.paymentSchedule);
    assert.equal(updates[0].paymentTermsNote, "preserve");
    await show(updates[0]);
    assert.equal(stages().props["aria-checked"], true);
    assert.equal(prepaid().props["aria-checked"], false);
    await act(async () => {
      prepaid().props.onClick();
    });
    assert.equal(updates.length, 1);
    const cancel = root()
      .findAllByType(SharedButton)
      .find(button => button.props.text === "ביטול");
    assert.ok(cancel);
    await act(async () => cancel.props.onClick());
    assert.equal(updates.length, 1);
    assert.equal(stages().props["aria-checked"], true);
    await act(async () => prepaid().props.onClick());
    const confirm = root()
      .findAllByType(SharedButton)
      .find(button => button.props.text === "מחק שלבים ובחר תנאים");
    assert.ok(confirm);
    await act(async () => confirm.props.onClick());
    assert.equal(updates[1].paymentTerms, "prepaid");
    assert.deepEqual(updates[1].paymentSchedule, []);
    await show(updates[1], true);
    assert.ok(radios().every(radio => radio.props.disabled));
    assert.equal(radios().filter(radio => radio.props["aria-checked"]).length, 1);
  } finally {
    await act(async () => {
      renderer.value?.unmount();
    });
  }
});

test("a fixed term changes directly without stages, then adding a stage replaces it", async () => {
  const { default: QuotationPayments } =
    await import("../src/pages/quotations/components/QuotationPayments");
  const quotation = quotationFixture();
  const updates: IQuotation[] = [];
  const renderer = { value: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      renderer.value = create(
        <QuotationPayments
          disabled={false}
          quotation={quotation}
          onChange={next => updates.push(next)}
        />,
      );
    });
    const other = renderer
      .value!.root.findAllByType(ChoiceRow)
      .find(radio => radio.props.children === "אחר");
    assert.ok(other);
    await act(async () => other.props.onClick());
    assert.equal(updates[0].paymentTerms, "other");
    assert.deepEqual(updates[0].paymentSchedule, []);
    await act(async () => {
      renderer.value!.update(
        <QuotationPayments
          disabled={false}
          quotation={updates[0]}
          onChange={next => updates.push(next)}
        />,
      );
    });
    const add = renderer
      .value!.root.findAllByType(SharedButton)
      .find(button => button.props.text === "+ שלב תשלום");
    assert.ok(add);
    await act(async () => add.props.onClick());
    assert.equal(updates[1].paymentTerms, null);
    assert.deepEqual(updates[1].paymentSchedule, [{ percent: "0", text: "" }]);
    await act(async () => {
      renderer.value!.update(
        <QuotationPayments
          disabled={false}
          quotation={updates[1]}
          onChange={next => updates.push(next)}
        />,
      );
    });
    const remove = renderer
      .value!.root.findAllByType(SharedButton)
      .find(button => button.props.ariaLabel === "הסר שלב 1");
    assert.ok(remove);
    await act(async () => remove.props.onClick());
    assert.equal(updates[2].paymentTerms, null);
    assert.deepEqual(updates[2].paymentSchedule, []);
    await act(async () => {
      renderer.value!.update(
        <QuotationPayments
          disabled={false}
          quotation={updates[2]}
          onChange={next => updates.push(next)}
        />,
      );
    });
    assert.ok(
      renderer
        .value!.root.findAllByProps({ role: "status" })
        .some(status => status.children.includes("בחרו תנאי תשלום או הוסיפו שלב תשלום.")),
    );
    assert.equal(quotation.paymentTerms, "prepaid");
  } finally {
    await act(async () => renderer.value?.unmount());
  }
});

test("equipment fields and removal have accessible names and preserve line identity on edits", async () => {
  const { default: QuotationLine } =
    await import("../src/pages/quotations/components/QuotationLine");
  const { catalogueLine } = await import("../src/utilities/quotation.utility");
  const { catalogueFixture } = await import("./quotation.fixture");
  const line = catalogueLine(catalogueFixture(), null);
  const updates: (typeof line)[] = [];
  const removed = mock.fn();
  const renderer = { value: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      renderer.value = create(
        <QuotationLine
          line={line}
          items={[line]}
          disabled={false}
          onRemove={removed}
          onChange={next => updates.push(next)}
        />,
      );
    });
    const root = renderer.value!.root;
    for (const label of ["תיאור בהצעה", "מיקום", `כמות (${line.unit})`, "מחיר ליחידה"]) {
      assert.equal(
        root.findAll(node => node.type === "input" && node.props["aria-label"] === label).length,
        1,
        label,
      );
    }
    const quantity = root.find(
      node => node.type === "input" && node.props["aria-label"] === `כמות (${line.unit})`,
    );
    await act(async () => {
      quantity.props.onChange({ target: { value: "3" } });
    });
    assert.deepEqual(updates, [{ ...line, quantity: "3" }]);
    const remove = root.find(
      node => node.type === "button" && node.props["aria-label"] === "הסר שורה",
    );
    await act(async () => {
      remove.props.onClick();
    });
    assert.equal(removed.mock.callCount(), 1);
    await act(async () => {
      renderer.value!.update(
        <QuotationLine
          disabled
          line={line}
          items={[line]}
          onRemove={removed}
          onChange={next => updates.push(next)}
        />,
      );
    });
    assert.equal(
      root.findAll(node => node.type === "button" && node.props["aria-label"] === "הסר שורה")
        .length,
      0,
    );
    assert.ok(root.findAllByType("input").every(input => input.props.disabled));
  } finally {
    await act(async () => {
      renderer.value?.unmount();
    });
  }
});

test("diagnostics hide without VRF equipment and display a missing condenser ratio without Infinity", async () => {
  const { default: QuotationDiagnostics } =
    await import("../src/pages/quotations/components/QuotationDiagnostics");
  const { catalogueLine } = await import("../src/utilities/quotation.utility");
  const { catalogueFixture } = await import("./quotation.fixture");
  const quotation = quotationFixture();
  const renderer = { value: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      renderer.value = create(<QuotationDiagnostics quotation={quotation} />);
    });
    assert.equal(renderer.value!.toJSON(), null);
    quotation.sections = [
      {
        id: "vrf",
        title: "קומה",
        systemType: "VRF",
        brand: "אלקטרה",
        items: [{ ...catalogueLine(catalogueFixture(), null), quantity: "2" }],
      },
    ];
    await act(async () => {
      renderer.value!.update(<QuotationDiagnostics quotation={quotation} />);
    });
    const content = JSON.stringify(renderer.value!.toJSON());
    assert.ok(content.includes("48000"));
    assert.ok(content.includes("—"));
    assert.ok(!content.includes("Infinity"));
    assert.ok(!content.includes("NaN"));
  } finally {
    await act(async () => {
      renderer.value?.unmount();
    });
  }
});

test("decimal editing preserves lexical input while focused and compacts only its blurred display", async () => {
  const { useState } = await import("react");
  const { default: QuotationDecimalInput } =
    await import("../src/pages/quotations/components/QuotationDecimalInput");
  const edits: string[] = [];
  const Harness = () => {
    const [value, setValue] = useState("1.0000");
    return (
      <QuotationDecimalInput
        label="כמות"
        value={value}
        onChange={event => {
          edits.push(event.target.value);
          setValue(event.target.value);
        }}
      />
    );
  };
  const renderer = { value: null as ReturnType<typeof create> | null };
  const input = () => renderer.value!.root.findByType("input");
  try {
    await act(async () => {
      renderer.value = create(<Harness />);
    });
    assert.equal(input().props.value, "1");
    await act(async () => {
      input().props.onFocus?.();
    });
    assert.equal(input().props.value, "1");
    for (const value of ["", "1.", "1.2500"]) {
      await act(async () => {
        input().props.onChange({ target: { value } });
      });
      assert.equal(input().props.value, value);
    }
    await act(async () => {
      input().props.onBlur();
    });
    assert.equal(input().props.value, "1.25");
    assert.deepEqual(edits, ["", "1.", "1.2500"]);
    await act(async () => {
      input().props.onFocus?.();
    });
    assert.equal(input().props.value, "1.25");
    await act(async () => {
      input().props.onChange({ target: { value: "1." } });
    });
    await act(async () => {
      input().props.onBlur();
    });
    assert.equal(input().props.value, "1.");
    assert.deepEqual(edits, ["", "1.", "1.2500", "1."]);
  } finally {
    await act(async () => {
      renderer.value?.unmount();
    });
  }
});

test("linked controller reassignment inherits parent quantity and removal stays explicit and accessible", async () => {
  const { default: QuotationLinkedControl } =
    await import("../src/pages/quotations/components/QuotationLinkedControl");
  const { catalogueLine } = await import("../src/utilities/quotation.utility");
  const { catalogueFixture } = await import("./quotation.fixture");
  const first = {
    ...catalogueLine(catalogueFixture(), null),
    id: "first",
    includesRemote: false,
    quantity: "2",
  };
  const second = { ...first, id: "second", quantity: "3.5", location: "חדר" };
  const included = { ...first, id: "included", includesRemote: true };
  const line = {
    ...first,
    id: "remote",
    equipmentRole: "control" as const,
    controlKind: "remote" as const,
    parentItemId: first.id,
  };
  const before = structuredClone(line);
  const updates: (typeof line)[] = [];
  const removed = mock.fn();
  const items = [first, second, included, line];
  const renderer = { value: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      renderer.value = create(
        <QuotationLinkedControl
          line={line}
          items={items}
          disabled={false}
          onRemove={removed}
          onChange={next => updates.push(next)}
        />,
      );
    });
    const root = renderer.value!.root;
    const toggle = root.find(node => node.type === "input" && node.props.type === "checkbox");
    assert.equal(toggle.props.checked, true);
    assert.equal(toggle.props["aria-label"], "הסר שלט");
    const select = root.findByType(QuotationSelect);
    assert.equal(select.props.label, "בקר עבור יחידה");
    assert.deepEqual(
      select.props.items.map(
        (option: Pick<ComponentProps<typeof QuotationSelect>["items"][number], "value">): string =>
          option.value,
      ),
      ["", first.id, second.id],
    );
    await act(async () => {
      select.props.onChange({ target: { value: second.id } });
    });
    assert.deepEqual(updates[0], { ...line, parentItemId: second.id, quantity: second.quantity });
    await act(async () => {
      select.props.onChange({ target: { value: "" } });
    });
    assert.deepEqual(updates[1], { ...line, parentItemId: null });
    const description = root.find(
      node => node.type === "input" && node.props["aria-label"] === "תיאור בקר בהצעה",
    );
    const price = root.find(
      node => node.type === "input" && node.props["aria-label"] === "מחיר בקר ליחידה",
    );
    await act(async () => {
      description.props.onChange({ target: { value: "שלט מעודכן" } });
    });
    await act(async () => {
      price.props.onChange({ target: { value: "12.3400" } });
    });
    assert.deepEqual(updates[2], { ...line, description: "שלט מעודכן" });
    assert.deepEqual(updates[3], { ...line, quotedPrice: "12.3400" });
    assert.equal(removed.mock.callCount(), 0);
    await act(async () => {
      root.findByType(CheckBox).props.onChange(false);
    });
    assert.equal(removed.mock.callCount(), 1);
    assert.deepEqual(line, before);
    await act(async () => {
      renderer.value!.update(
        <QuotationLinkedControl
          disabled
          line={line}
          items={items}
          onRemove={removed}
          onChange={next => updates.push(next)}
        />,
      );
    });
    assert.ok(root.findAllByType("input").every(input => input.props.disabled));
    assert.equal(root.findByType(QuotationSelect).props.disabled, true);
    assert.equal(
      root.find(node => node.type === "input" && node.props.type === "checkbox").props.checked,
      true,
    );
  } finally {
    await act(async () => {
      renderer.value?.unmount();
    });
  }
});

test("direct customer search keeps an unloaded selection and selects duplicate names by identifier", async () => {
  const { default: Autocomplete } = await import("../src/components/Autocomplete/Autocomplete");
  const { SEARCH_DEBOUNCE_MS } = await import("../src/constants/search.constant");
  const { default: QuotationCustomerPicker } =
    await import("../src/pages/quotations/components/QuotationCustomerPicker");
  const selected = { id: "selected-customer", name: "לקוח קיים" };
  const choices = [
    { id: "first-match", name: "שם זהה" },
    { id: "second-match", name: "שם זהה" },
  ];
  const customers = mock.method(customerService, "getByFilter", async query =>
    query.search === "שם זהה" ? choices : [],
  );
  const customer = mock.method(customerService, "getById", async () => selected);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const selectedIds: string[] = [];
  const router = createMemoryRouter([
    {
      path: "/",
      element: (
        <QueryClientProvider client={client}>
          <QuotationCustomerPicker value={selected.id} onChange={id => selectedIds.push(id)} />
        </QueryClientProvider>
      ),
    },
  ]);
  const state = { renderer: null as ReturnType<typeof create> | null };
  const root = () => state.renderer!.root;
  const autocomplete = () => root().findByType(Autocomplete);
  try {
    await act(async () => {
      state.renderer = create(<RouterProvider router={router} />);
    });
    await act(async () => {
      await settle(30);
    });
    assert.equal(root().findAllByType("details").length, 0);
    assert.equal(root().findAllByType("select").length, 1);
    assert.equal(autocomplete().props.value, selected.id);
    assert.deepEqual(autocomplete().props.selectedItem, {
      value: selected.id,
      label: selected.name,
    });
    assert.equal(autocomplete().props.isClearable, false);
    assert.equal(autocomplete().props.isClientFiltered, false);
    await act(async () => autocomplete().props.onSearch("שם זהה"));
    await act(async () => settle(SEARCH_DEBOUNCE_MS + 30));
    await act(async () => settle(30));
    assert.equal(customers.mock.calls.at(-1)!.arguments[0].search, "שם זהה");
    assert.deepEqual(autocomplete().props.items, [
      { value: choices[0].id, label: choices[0].name },
      { value: choices[1].id, label: choices[1].name },
    ]);
    await act(async () => autocomplete().props.onSearch("אין תוצאות"));
    await act(async () => settle(SEARCH_DEBOUNCE_MS + 30));
    await act(async () => settle(30));
    assert.deepEqual(autocomplete().props.items, []);
    assert.equal(autocomplete().props.value, selected.id);
    await act(async () => autocomplete().props.onChange(choices[1].id));
    assert.deepEqual(selectedIds, [choices[1].id]);
    assert.deepEqual(selected, { id: "selected-customer", name: "לקוח קיים" });
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    router.dispose();
    customers.mock.restore();
    customer.mock.restore();
  }
});

test("direct project search stays customer-scoped, retains the selected name and permits clearing", async () => {
  const { default: Autocomplete } = await import("../src/components/Autocomplete/Autocomplete");
  const { SEARCH_DEBOUNCE_MS } = await import("../src/constants/search.constant");
  const { default: QuotationProjectPicker } =
    await import("../src/pages/quotations/components/QuotationProjectPicker");
  const selected = { id: "selected-project", name: "פרויקט מקושר מחוץ לתוצאות" };
  const other = { id: "other-project", name: "פרויקט אחר" };
  const projects = mock.method(quotationService, "projectChoices", async (_customerId, search) =>
    search === "פרויקט אחר" ? [other] : [],
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const selectedIds: (string | null)[] = [];
  const state = { renderer: null as ReturnType<typeof create> | null };
  const root = () => state.renderer!.root;
  const autocomplete = () => root().findByType(Autocomplete);
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <QuotationProjectPicker
            disabled={false}
            value={selected.id}
            customerId="customer-scope"
            selectedName={selected.name}
            onChange={id => selectedIds.push(id)}
          />
        </QueryClientProvider>,
      );
    });
    assert.equal(root().findAllByType("details").length, 0);
    assert.equal(root().findAllByType("select").length, 1);
    assert.equal(autocomplete().props.value, selected.id);
    assert.deepEqual(autocomplete().props.selectedItem, {
      value: selected.id,
      label: selected.name,
    });
    assert.equal(autocomplete().props.isClearable, true);
    assert.equal(autocomplete().props.isClientFiltered, false);
    await act(async () => autocomplete().props.onSearch("פרויקט אחר"));
    await act(async () => settle(SEARCH_DEBOUNCE_MS + 30));
    assert.deepEqual(projects.mock.calls.at(-1)!.arguments, ["customer-scope", "פרויקט אחר"]);
    await act(async () => settle(30));
    assert.deepEqual(autocomplete().props.items, [{ value: other.id, label: other.name }]);
    await act(async () => autocomplete().props.onSearch("אין תוצאות"));
    await act(async () => settle(SEARCH_DEBOUNCE_MS + 30));
    await act(async () => settle(30));
    assert.deepEqual(autocomplete().props.items, []);
    assert.equal(autocomplete().props.value, selected.id);
    await act(async () => {
      autocomplete().props.onChange(other.id);
      autocomplete().props.onChange(null);
    });
    assert.deepEqual(selectedIds, [other.id, null]);
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    projects.mock.restore();
  }
});

test("review summary shows a concise warning count and readable VAT", async () => {
  const quotation = {
    ...quotationFixture(),
    vatRate: "18.0000",
    warnings: [
      { key: "first", text: "First warning", acknowledged: true },
      { key: "second", text: "Second warning", acknowledged: false },
    ],
  };
  const state = { renderer: null as ReturnType<typeof create> | null };
  const props = {
    blocked: false,
    disabled: false,
    canApprove: true,
    onChange: () => {},
    onTransition: async () => {},
    onAcknowledge: async () => {},
  };
  try {
    await act(async () => {
      state.renderer = create(<QuotationSummary {...props} quotation={quotation} />);
    });
    assert.ok(JSON.stringify(state.renderer!.toJSON()).includes("1 התראות פתוחות"));
    assert.ok(JSON.stringify(state.renderer!.toJSON()).includes("מע״מ 18%"));
    assert.ok(!JSON.stringify(state.renderer!.toJSON()).includes("מע״מ 18.0000%"));
    await act(async () => {
      state.renderer!.update(
        <QuotationSummary {...props} quotation={{ ...quotation, warnings: [] }} />,
      );
    });
    assert.ok(JSON.stringify(state.renderer!.toJSON()).includes("אין התראות פתוחות"));
  } finally {
    await act(async () => state.renderer?.unmount());
  }
});

for (const role of ["header", "pipe"] as const) {
  test(`${role} accessory rows preserve catalogue snapshots and exact numeric edits while using compact captions`, async () => {
    const { default: QuotationLine } =
      await import("../src/pages/quotations/components/QuotationLine");
    const { default: QuotationAccessoryLine } =
      await import("../src/pages/quotations/components/QuotationAccessoryLine");
    const { catalogueLine } = await import("../src/utilities/quotation.utility");
    const { catalogueFixture } = await import("./quotation.fixture");
    const line = {
      ...catalogueLine(catalogueFixture(), null),
      equipmentRole: role,
      unit: role === "pipe" ? "מ׳" : "יח׳",
      quantity: "8.0000",
      quotedPrice: "12.3400",
      location: "original location",
    };
    const before = structuredClone(line);
    const updates: IQuotationLine[] = [];
    const removed = mock.fn();
    const state = { renderer: null as ReturnType<typeof create> | null };
    const root = () => state.renderer!.root;
    const input = (label: string) =>
      root().find(node => node.type === "input" && node.props["aria-label"] === label);
    try {
      await act(async () => {
        state.renderer = create(
          <QuotationLine
            line={line}
            items={[line]}
            disabled={false}
            onRemove={removed}
            onChange={next => updates.push(next)}
          />,
        );
      });
      assert.equal(root().findAllByType(QuotationAccessoryLine).length, 1);
      assert.equal(root().findAllByType("input").length, 3);
      assert.equal(
        root().findAll(node => node.type === "input" && node.props["aria-label"] === "מיקום")
          .length,
        0,
      );
      for (const caption of [
        "פריט",
        role === "pipe" ? "מטרים" : "כמות",
        role === "pipe" ? "מחיר למטר" : "מחיר",
      ]) {
        assert.ok(
          root().findAll(node => node.type === "span" && node.children.includes(caption)).length,
        );
      }
      assert.equal(input(`כמות (${line.unit})`).props.value, "8");
      assert.equal(input("מחיר ליחידה").props.value, "12.34");
      await act(async () => {
        input(`כמות (${line.unit})`).props.onChange({ target: { value: "2.1250" } });
      });
      await act(async () => {
        input("מחיר ליחידה").props.onChange({ target: { value: "123.4500" } });
      });
      await act(async () => {
        input("תיאור בהצעה").props.onChange({ target: { value: "תיאור הצעה מקומי" } });
      });
      assert.deepEqual(updates, [
        { ...line, quantity: "2.1250" },
        { ...line, quotedPrice: "123.4500" },
        { ...line, description: "תיאור הצעה מקומי" },
      ]);
      assert.deepEqual(line, before);
      await act(async () => {
        root()
          .find(node => node.type === "button" && node.props["aria-label"] === "הסר שורה")
          .props.onClick();
      });
      assert.equal(removed.mock.callCount(), 1);
      await act(async () => {
        state.renderer!.update(
          <QuotationLine
            disabled
            line={line}
            items={[line]}
            onRemove={removed}
            onChange={next => updates.push(next)}
          />,
        );
      });
      assert.equal(root().findAllByType("button").length, 0);
      assert.ok(
        root()
          .findAllByType("input")
          .every(field => field.props.disabled),
      );
    } finally {
      await act(async () => state.renderer?.unmount());
    }
  });
}

for (const status of ["draft", "review", "approved"] as const) {
  for (const canDelete of [false, true]) {
    test(`${status}: delete permission independently controls action and successful navigation`, async () => {
      const base = { ...quotationFixture(), status };
      const remove = mock.method(quotationService, "delete", async () => {});
      const customers = mock.method(customerService, "getByFilter", async () => []);
      const customer = mock.method(customerService, "getById", async () => ({
        id: base.customerId,
        name: "Customer",
      }));
      const projects = mock.method(quotationService, "projectChoices", async () => []);
      const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
      client.setQueryData(QUOTATION_DETAIL_KEY(base.id), base);
      const router = createMemoryRouter(
        [
          {
            path: "/detail",
            element: (
              <QueryClientProvider client={client}>
                <QuotationEditor
                  initial={base}
                  editable={false}
                  canApprove={false}
                  canDelete={canDelete}
                />
              </QueryClientProvider>
            ),
          },
          { path: "/quotations", element: <p>Quotation list</p> },
        ],
        { initialEntries: ["/detail"] },
      );
      const state = { renderer: null as ReturnType<typeof create> | null };
      try {
        await act(async () => {
          state.renderer = create(<RouterProvider router={router} />);
        });
        const cards = state.renderer!.root.findAllByType(QuotationDelete);
        assert.equal(cards.length, canDelete ? 1 : 0);
        if (canDelete) {
          await act(() => cards[0].props.onDelete());
          assert.equal(remove.mock.callCount(), 1);
          assert.equal(router.state.location.pathname, "/quotations");
          assert.equal(router.state.historyAction, "REPLACE");
          assert.equal(
            [...router.state.blockers.values()].some(blocker => blocker.state === "blocked"),
            false,
          );
          assert.equal(client.getQueryData(QUOTATION_DETAIL_KEY(base.id)) ?? null, null);
        }
      } finally {
        await act(async () => state.renderer?.unmount());
        router.dispose();
        client.clear();
        remove.mock.restore();
        customers.mock.restore();
        customer.mock.restore();
        projects.mock.restore();
      }
    });
  }
}

test("delete confirmation supports cancel, retry and reload while blocking pending actions", async () => {
  const calls = { remove: 0, reload: 0 };
  const props = {
    number: "Q-123",
    blocked: false,
    pending: false,
    error: null as string | null,
    onDelete: async () => {
      calls.remove += 1;
    },
    onReload: async () => {
      calls.reload += 1;
    },
  };
  const state = { renderer: null as ReturnType<typeof create> | null };
  const buttons = () => state.renderer!.root.findAllByType(QuotationButton);
  const popup = () => state.renderer!.root.findByType(GenericPopup);
  try {
    await act(async () => {
      state.renderer = create(<QuotationDelete {...props} />);
    });

    assert.equal(buttons().length, 1);
    assert.equal(buttons()[0].props.ariaLabel, "מחיקת ההצעה");
    assert.equal("text" in buttons()[0].props, false);
    await act(async () => buttons()[0].props.onClick());
    assert.equal(calls.remove, 0);
    assert.ok(
      state
        .renderer!.root.findAllByType("p")
        .some(node => node.children.join("").includes("Q-123")),
    );
    await act(async () => popup().props.buttons.secondary.onClick());
    assert.equal(state.renderer!.root.findAllByType(GenericPopup).length, 0);
    await act(async () => buttons()[0].props.onClick());
    await act(async () => state.renderer!.update(<QuotationDelete {...props} error="Conflict" />));
    assert.equal(
      state.renderer!.root.findByProps({ role: "alert" }).findByType(ValidationMessageText).props
        .text === "Conflict",
      true,
    );
    await act(async () => popup().props.buttons.primary.onClick());
    await act(async () => buttons()[1].props.onClick());
    assert.deepEqual(calls, { remove: 1, reload: 1 });
    await act(async () =>
      state.renderer!.update(<QuotationDelete {...props} pending error="Conflict" />),
    );
    assert.equal(buttons()[0].props.disabled, true);
    assert.equal(
      state.renderer!.root.findByType(GenericPopup).props.buttons.primary.isDisabled,
      true,
    );
    await act(async () => state.renderer!.update(<QuotationDelete {...props} blocked />));
    assert.equal(buttons()[0].props.disabled, true);
  } finally {
    await act(async () => state.renderer?.unmount());
  }
});

test("sales-agent picker selects and clears an eligible user", async () => {
  const { default: Autocomplete } = await import("../src/components/Autocomplete/Autocomplete");
  setSalesAgentTestSession();
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  client.setQueryData(salesAgentTestQueryKey, [
    { id: "agent-1", firstName: "Dana", lastName: "Cohen", employeeNumber: "007" },
  ]);
  const selected: (string | null)[] = [];
  const state = { renderer: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <QuotationSalesAgentPicker
            value={null}
            disabled={false}
            onChange={agentId => selected.push(agentId)}
          />
        </QueryClientProvider>,
      );
    });
    const picker = () => state.renderer!.root.findByType(Autocomplete);
    assert.equal(picker().props.isClearable, true);
    assert.deepEqual(picker().props.items, [{ value: "agent-1", label: "Dana Cohen · 007" }]);
    await act(async () => picker().props.onSearch("007"));
    assert.deepEqual(picker().props.items, [{ value: "agent-1", label: "Dana Cohen · 007" }]);
    await act(async () => picker().props.onSearch("missing"));
    assert.deepEqual(picker().props.items, []);
    await act(async () => picker().props.onSearch("007"));
    await act(async () => picker().props.onChange("agent-1"));
    await act(async () => picker().props.onChange(null));

    assert.deepEqual(selected, ["agent-1", null]);
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    setSession(null);
  }
});

test("sales-agent picker keeps an unavailable historical employee name visible", async () => {
  const { default: Autocomplete } = await import("../src/components/Autocomplete/Autocomplete");
  setSalesAgentTestSession();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: Infinity } },
  });
  client.setQueryData(salesAgentTestQueryKey, []);
  const state = { renderer: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <QuotationSalesAgentPicker
            disabled
            onChange={() => {}}
            value="former-agent"
            selectedName="Neta Levi · 008"
          />
        </QueryClientProvider>,
      );
    });
    const picker = state.renderer!.root.findByType(Autocomplete);
    assert.equal(picker.props.value, "former-agent");
    assert.deepEqual(picker.props.items, []);
    assert.deepEqual(picker.props.selectedItem, {
      value: "former-agent",
      label: "Neta Levi · 008 · לא זמין",
    });
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    setSession(null);
  }
});

test("sales-agent picker does not query employees without employee read access", async () => {
  const { default: Autocomplete } = await import("../src/components/Autocomplete/Autocomplete");
  setSalesAgentTestSession([PERMISSIONS.QUOTATIONS_READ]);
  const salesAgents = mock.method(quotationService, "salesAgents", async () => []);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const state = { renderer: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <QuotationSalesAgentPicker
            disabled={false}
            onChange={() => {}}
            value="former-agent"
            selectedName="Neta Levi · 008"
          />
        </QueryClientProvider>,
      );
    });
    const picker = state.renderer!.root.findByType(Autocomplete);
    assert.equal(picker.props.disabled, true);
    assert.equal(picker.props.value, "former-agent");
    assert.deepEqual(picker.props.items, []);
    assert.deepEqual(picker.props.selectedItem, {
      value: "former-agent",
      label: "Neta Levi · 008",
    });
    assert.equal(salesAgents.mock.callCount(), 0);
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    salesAgents.mock.restore();
    setSession(null);
  }
});

test("approved quotation assignment and clearing use the agent-only update", async () => {
  const { default: Autocomplete } = await import("../src/components/Autocomplete/Autocomplete");
  setSalesAgentTestSession();
  const quotation = { ...quotationFixture(), status: "approved" as const };
  const customerList = mock.method(customerService, "getByFilter", async () => []);
  const customer = mock.method(customerService, "getById", async () => ({
    id: quotation.customerId,
    name: "Customer",
  }));
  const projects = mock.method(quotationService, "projectChoices", async () => []);
  const save = mock.method(quotationService, "save", async quotation => quotation);
  const updates = mock.method(quotationService, "updateSalesAgent", async input => ({
    ...quotation,
    salesAgentId: input.salesAgentId,
    version: input.version + 1,
  }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  client.setQueryData(salesAgentTestQueryKey, [
    { id: "agent-1", firstName: "Dana", lastName: "Cohen", employeeNumber: "007" },
  ]);
  const router = createMemoryRouter([
    {
      path: "/",
      element: (
        <QueryClientProvider client={client}>
          <QuotationEditor editable canApprove initial={quotation} />
        </QueryClientProvider>
      ),
    },
  ]);
  const state = { renderer: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      state.renderer = create(<RouterProvider router={router} />);
    });
    assert.equal(state.renderer!.root.findByType(QuotationCustomerPicker).props.disabled, true);
    assert.equal(state.renderer!.root.findByType(QuotationProjectPicker).props.disabled, true);
    assert.equal(
      state
        .renderer!.root.findAllByType(QuotationDecimalInput)
        .every(input => input.props.disabled),
      true,
    );
    assert.equal(
      state.renderer!.root.findAllByType(QuotationInput).every(input => input.props.disabled),
      true,
    );
    assert.equal(
      state
        .renderer!.root.findAllByType("textarea")
        .filter((node): boolean => !node.props["aria-hidden"])
        .every((node): boolean => node.props.disabled),
      true,
    );
    assert.equal(state.renderer!.root.findByType(QuotationSummary).props.disabled, true);
    const agentPicker = () =>
      state.renderer!.root.findByType(QuotationSalesAgentPicker).findByType(Autocomplete);
    assert.equal(agentPicker().props.disabled, false);
    await act(async () => agentPicker().props.onChange("agent-1"));
    await act(async () => {
      await settle(0);
    });
    assert.deepEqual(updates.mock.calls[0]?.arguments[0], {
      id: quotation.id,
      version: 1,
      salesAgentId: "agent-1",
    });
    assert.equal(agentPicker().props.value, "agent-1");
    assert.equal(
      state.renderer!.root.findByType(QuotationSummary).props.quotation.salesAgentId,
      "agent-1",
    );
    await act(async () => agentPicker().props.onChange(null));
    await act(async () => {
      await settle(0);
    });
    assert.deepEqual(updates.mock.calls[1]?.arguments[0], {
      id: quotation.id,
      version: 2,
      salesAgentId: null,
    });
    assert.equal(agentPicker().props.value, null);
    assert.equal(
      state.renderer!.root.findByType(QuotationSummary).props.quotation.salesAgentId,
      null,
    );
    assert.equal(save.mock.callCount(), 0);
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    router.dispose();
    updates.mock.restore();
    save.mock.restore();
    customerList.mock.restore();
    customer.mock.restore();
    projects.mock.restore();
    setSession(null);
  }
});
