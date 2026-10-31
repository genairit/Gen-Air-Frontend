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
