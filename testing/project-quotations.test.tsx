import { test, mock } from "node:test";
import assert from "node:assert/strict";
import Chip from "../src/components/Chip/Chip";
import { act, create } from "react-test-renderer";
import Button from "../src/components/Button/Button";
import { quotationFixture } from "./quotation.fixture";
import { customerService } from "../src/services/customer.service";
import QuotationsPage from "../src/pages/quotations/QuotationsPage";
import InlineError from "../src/components/InlineError/InlineError";
import { quotationService } from "../src/services/quotation.service";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import LoadingState from "../src/components/LoadingState/LoadingState";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHashTargetFocus } from "../src/hooks/hash-target-focus.hook";
import QuotationRow from "../src/pages/quotations/components/QuotationRow";
import type { IProjectQuotation } from "../src/interfaces/quotation.interface";
import ProjectQuotationsCard from "../src/pages/project/components/ProjectQuotationsCard";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
Reflect.set(globalThis, "window", new EventTarget());

const projectRow = (changes: Partial<IProjectQuotation>): IProjectQuotation => ({
  ...quotationFixture(),
  customerName: "יזם בדיקה",
  projectName: "מגדלי הבדיקה",
  projectRole: "primary",
  sharedFromCode: null,
  sharedCount: 0,
  sharedApartmentNumbers: [],
  ...changes,
});

const settle = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

const renderAt = async (element: React.ReactElement, path = "/") => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const router = createMemoryRouter(
    [
      { path: "/", element: <QueryClientProvider client={client}>{element}</QueryClientProvider> },
      { path: "/quotations/:quotationId", element: <p>quotation</p> },
    ],
    { initialEntries: [path] },
  );
  const state = { renderer: null as ReturnType<typeof create> | null };
  await act(async () => {
    state.renderer = create(<RouterProvider router={router} />);
  });
  return {
    router,
    root: () => state.renderer!.root,
    close: async () => {
      await act(async () => state.renderer?.unmount());
      client.clear();
      router.dispose();
    },
  };
};

const chipLabels = (root: () => ReturnType<typeof create>["root"]) =>
  root()
    .findAllByType(Chip)
    .map(chip => chip.props.label);

test("project quotations card shows loading, then both sharing row variants", async () => {
  const gate = Promise.withResolvers<{
    total: number;
    nextCursor: null;
    items: IProjectQuotation[];
  }>();
  const list = mock.method(quotationService, "projectQuotations", () => gate.promise);
  const view = await renderAt(<ProjectQuotationsCard projectId="building" />);
  try {
    assert.equal(view.root().findAllByType(LoadingState).length, 1);
    await act(async () => {
      gate.resolve({
        total: 2,
        nextCursor: null,
        items: [
          projectRow({
            id: "primary",
            sharedCount: 5,
            sharedApartmentNumbers: ["4", "7", "12", "15", "16"],
          }),
          projectRow({ id: "shared", projectRole: "shared", sharedFromCode: "BL-10001" }),
        ],
      });
    });
    await settle();
    assert.equal(view.root().findAllByType(QuotationRow).length, 2);
    assert.deepEqual(chipLabels(view.root), ["משותפת ל-5 דירות", "משותפת מבניין ⁨BL-10001⁩"]);
    const preview = view.root().findAll(node => node.type === "bdi");
    assert.ok(preview.some(node => node.children.includes("דירות 4, 7, 12 +2")));
    await act(() => view.root().findAllByType(QuotationRow)[0].props.onOpen());
    assert.equal(view.router.state.location.pathname, "/quotations/primary");
    assert.equal(view.router.state.location.hash, "#apartment-sharing");
  } finally {
    await view.close();
    list.mock.restore();
  }
});

test("project quotations card shows an empty state and no chips for unshared rows", async () => {
  const list = mock.method(quotationService, "projectQuotations", async () => ({
    total: 0,
    nextCursor: null,
    items: [],
  }));
  const view = await renderAt(<ProjectQuotationsCard projectId="apartment" />);
  try {
    await settle();
    const texts = view
      .root()
      .findAll(node => node.props.children === "אין עדיין הצעות מחיר בפרויקט זה.");
    assert.ok(texts.length > 0);
    assert.equal(view.root().findAllByType(QuotationRow).length, 0);
  } finally {
    await view.close();
    list.mock.restore();
  }
});

test("project quotations card reports errors, retries and loads more pages", async () => {
  const responses = [
    () => Promise.reject(new Error("שגיאת רשת")),
    async () => ({ total: 2, nextCursor: "next", items: [projectRow({ id: "first" })] }),
    async () => ({ total: 2, nextCursor: null, items: [projectRow({ id: "second" })] }),
  ];
  const list = mock.method(quotationService, "projectQuotations", () => responses.shift()!());
  const view = await renderAt(<ProjectQuotationsCard projectId="building" />);
  const button = (text: string) =>
    view
      .root()
      .findAllByType(Button)
      .find(node => node.props.text === text);
  try {
    await settle();
    assert.equal(view.root().findAllByType(InlineError).length, 1);
    await act(() => button("נסה שוב")!.props.onClick());
    await settle();
    assert.equal(view.root().findAllByType(InlineError).length, 0);
    assert.equal(view.root().findAllByType(QuotationRow).length, 1);
    await act(() => button("טען עוד הצעות")!.props.onClick());
    await settle();
    assert.deepEqual(
      view
        .root()
        .findAllByType(QuotationRow)
        .map(row => row.props.quotation.id),
      ["first", "second"],
    );
    assert.equal(button("טען עוד הצעות"), undefined);
    assert.deepEqual(
      list.mock.calls.map(call => call.arguments),
      [
        ["building", null],
        ["building", null],
        ["building", "next"],
      ],
    );
  } finally {
    await view.close();
    list.mock.restore();
  }
});

const HashProbe = ({ ready }: { ready: boolean }) => {
  useHashTargetFocus({
    ready,
    targetId: "apartment-sharing",
    focusId: "apartment-sharing-heading",
  });
  return null;
};

const withFakeDocument = () => {
  const calls: string[] = [];
  const element = (id: string) => ({
    scrollIntoView: () => calls.push(`scroll:${id}`),
    focus: () => calls.push(`focus:${id}`),
  });
  Reflect.set(globalThis, "document", { getElementById: (id: string) => element(id) });
  Reflect.set(globalThis.window, "matchMedia", () => ({ matches: true }));
  return {
    calls,
    restore: () => {
      Reflect.deleteProperty(globalThis, "document");
      Reflect.deleteProperty(globalThis.window, "matchMedia");
    },
  };
};

for (const [name, path, ready, expected] of [
  [
    "targeted and ready",
    "/#apartment-sharing",
    true,
    ["scroll:apartment-sharing", "focus:apartment-sharing-heading"],
  ],
  ["targeted but not ready", "/#apartment-sharing", false, []],
  ["ready without the hash", "/", true, []],
  ["ready with another hash", "/#other", true, []],
] as const) {
  test(`hash target focus: ${name}`, async () => {
    const fake = withFakeDocument();
    const view = await renderAt(<HashProbe ready={ready} />, path);
    try {
      assert.deepEqual(fake.calls, expected);
    } finally {
      await view.close();
      fake.restore();
    }
  });
}

test("the global quotation list renders one shared QuotationRow per quotation", async () => {
  const list = mock.method(quotationService, "list", async () => ({
    items: [projectRow({ id: "one" }), projectRow({ id: "two", number: "2611-000002" })],
    nextCursor: null,
  }));
  const counts = mock.method(quotationService, "statusCounts", async () => ({
    all: 2,
    draft: 2,
    review: 0,
    approved: 0,
  }));
  const customers = mock.method(customerService, "getByFilter", async () => []);
  const view = await renderAt(<QuotationsPage />);
  try {
    await settle();
    const rows = view.root().findAllByType(QuotationRow);
    assert.deepEqual(
      rows.map(row => row.props.quotation.id),
      ["one", "two"],
    );
    assert.equal(rows[0].props.details ?? null, null);
    await act(() => rows[1].props.onOpen());
    assert.equal(view.router.state.location.pathname, "/quotations/two");
  } finally {
    await view.close();
    [list, counts, customers].forEach(method => method.mock.restore());
  }
});
