import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import { quotationFixture } from "./quotation.fixture";
import { setTimeout as settle } from "node:timers/promises";
import { customerService } from "../src/services/customer.service";
import { quotationService } from "../src/services/quotation.service";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { getActiveNavigationId } from "../src/utilities/route.utility";
import type { IQuotation } from "../src/interfaces/quotation.interface";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QUOTATION_AUTOSAVE_MS } from "../src/constants/quotation.constant";
import QuotationEditor from "../src/pages/quotations/components/QuotationEditor";
import QuotationReview from "../src/pages/quotations/components/QuotationReview";
import QuotationSummary from "../src/pages/quotations/components/QuotationSummary";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
Reflect.set(globalThis, "window", new EventTarget());
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
      assert.equal(state.renderer!.root.findAllByType(QuotationReview).length, expectedReviews);
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
      root().findByType(QuotationReview).props.onEdit();
    });
    assert.equal(root().findAllByType(QuotationReview).length, 0);
    await act(() => root().findByType(QuotationSummary).props.onTransition("draft"));
    assert.equal(root().findAllByType(QuotationReview).length, 0);
    await act(() => root().findByType(QuotationSummary).props.onTransition("review"));
    assert.equal(transition.mock.callCount(), 2);
    assert.equal(root().findAllByType(QuotationReview).length, 1);
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

test("payment chips expose a single selected radio and change only quotation terms", async () => {
  const { default: QuotationPayments } =
    await import("../src/pages/quotations/components/QuotationPayments");
  const quotation = {
    ...quotationFixture(),
    paymentSchedule: [{ percent: "35", text: "הזמנה" }],
    paymentTermsNote: "preserve",
  };
  const before = structuredClone(quotation);
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
    const group = renderer.value!.root.findByProps({ role: "radiogroup" });
    assert.equal(group.props["aria-label"], "תנאי תשלום");
    const radios = group.findAllByProps({ role: "radio" });
    assert.ok(radios.length > 1);
    assert.equal(radios.filter(radio => radio.props["aria-checked"]).length, 1);
    assert.ok(radios.every(radio => radio.type === "button" && radio.props.type === "button"));
    await act(async () => {
      radios.find(radio => !radio.props["aria-checked"])!.props.onClick();
    });
    assert.equal(updates.length, 1);
    assert.notEqual(updates[0].paymentTerms, quotation.paymentTerms);
    assert.deepEqual({ ...updates[0], paymentTerms: quotation.paymentTerms }, quotation);
    assert.equal(updates[0].paymentSchedule, quotation.paymentSchedule);
    assert.deepEqual(quotation, before);
    await act(async () => {
      renderer.value!.update(
        <QuotationPayments disabled quotation={updates[0]} onChange={next => updates.push(next)} />,
      );
    });
    assert.ok(
      renderer.value!.root.findAllByProps({ role: "radio" }).every(radio => radio.props.disabled),
    );
    assert.equal(
      renderer.value!.root.findAllByProps({ role: "radio", "aria-checked": true }).length,
      1,
    );
  } finally {
    await act(async () => {
      renderer.value?.unmount();
    });
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
    const select = root.findByType("select");
    assert.equal(select.props["aria-label"], "בקר עבור יחידה");
    assert.deepEqual(
      select.findAllByType("option").map(option => option.props.value),
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
      toggle.props.onChange();
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
    assert.equal(root.findByType("select").props.disabled, true);
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
