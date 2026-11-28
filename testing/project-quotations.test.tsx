import { test, mock } from "node:test";
import assert from "node:assert/strict";
import Chip from "../src/components/Chip/Chip";
import Card from "../src/components/Card/Card";
import { act, create } from "react-test-renderer";
import Button from "../src/components/Button/Button";
import { quotationFixture } from "./quotation.fixture";
import { setSession } from "../src/store/session.store";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { PERMISSIONS } from "../src/constants/permission.constant";
import InlineError from "../src/components/InlineError/InlineError";
import { quotationService } from "../src/services/quotation.service";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import LoadingState from "../src/components/LoadingState/LoadingState";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHashTargetFocus } from "../src/hooks/hash-target-focus.hook";
import type { IProjectQuotation } from "../src/interfaces/quotation.interface";
import ProjectWorkspace from "../src/components/ProjectWorkspace/ProjectWorkspace";
import { buildProjectQuotationCreatePath } from "../src/constants/navigation.constant";
import ProjectQuotationCard from "../src/pages/project/components/ProjectQuotationCard";
import ProjectQuotationsCard from "../src/pages/project/components/ProjectQuotationsCard";
import ProjectQuotationCreateButton from "../src/pages/project/components/ProjectQuotationCreateButton";

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
      { path: "*", element: <QueryClientProvider client={client}>{element}</QueryClientProvider> },
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
  const view = await renderAt(
    <ProjectQuotationsCard projectId="building" />,
    "/projects/building?tab=quotations",
  );
  try {
    assert.equal(view.root().findAllByType(LoadingState).length, 1);
    await act(async () => {
      gate.resolve({
        total: 3,
        nextCursor: null,
        items: [
          projectRow({
            id: "primary",
            sharedCount: 5,
            sharedApartmentNumbers: ["4", "7", "12", "15", "16"],
          }),
          projectRow({
            id: "shared",
            number: "2610-000002",
            status: "approved",
            projectRole: "shared",
            sharedFromCode: "BL-10001",
          }),
          projectRow({ id: "other-customer", customerName: "לקוח אחר", number: "2610-000003" }),
        ],
      });
    });
    await settle();
    const cards = view.root().findAllByType(Card);
    assert.deepEqual(
      cards.map(card => card.props.ariaLabel),
      [
        "2610-000001 · יזם בדיקה · טיוטה",
        "2610-000002 · יזם בדיקה · הזמנה",
        "2610-000003 · לקוח אחר · טיוטה",
      ],
    );
    assert.equal(view.root().findAllByType("time").length, 3);
    assert.ok(cards[0].findAllByType("bdi").some(node => node.children.includes("יזם בדיקה")));
    assert.ok(cards[0].findAllByType("bdi").every(node => !node.children.includes("אלקטרה")));
    assert.deepEqual(chipLabels(view.root), ["משותפת ל-5 דירות", "משותפת מבניין ⁨BL-10001⁩"]);
    const preview = view.root().findAll(node => node.type === "bdi");
    assert.ok(preview.some(node => node.children.includes("דירות 4, 7, 12 +2")));
    await act(() => view.root().findAllByType(ProjectQuotationCard)[0].props.onOpen());
    assert.equal(view.router.state.location.pathname, "/quotations/primary");
    assert.equal(view.router.state.location.hash, "#apartment-sharing");
    assert.deepEqual(view.router.state.location.state, {
      quotationReturnTo: "/projects/building?tab=quotations",
    });
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
    assert.equal(view.root().findAllByType(ProjectQuotationCard).length, 0);
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
    assert.equal(view.root().findAllByType(ProjectQuotationCard).length, 1);
    await act(() => button("טען עוד הצעות")!.props.onClick());
    await settle();
    assert.deepEqual(
      view
        .root()
        .findAllByType(ProjectQuotationCard)
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

test("the active project quotations tab offers its create action only to creators, including on an empty project", async () => {
  const basePath = "/projects/building";
  const readSession = {
    accessToken: "project-quotation-test",
    user: {
      id: "reader",
      email: "",
      phone: "",
      lastName: "",
      firstName: "",
      employeeNumber: "",
      deletedAt: null,
      role: USER_ROLES.SECRETARY,
      assignedRoles: [USER_ROLES.SECRETARY],
      permissions: [PERMISSIONS.QUOTATIONS_READ],
    },
  };
  setSession(readSession);
  const view = await renderAt(
    <ProjectWorkspace
      header={null}
      defaultTab="details"
      panels={[
        { id: "details", label: "פרטים", content: "פרטים" },
        {
          id: "quotations",
          label: "הצעות מחיר",
          content: "אין עדיין הצעות מחיר בפרויקט זה.",
          action: <ProjectQuotationCreateButton projectId="building" />,
        },
      ]}
    />,
    basePath,
  );
  const createButtons = () =>
    view
      .root()
      .findAllByType(Button)
      .filter(node => node.props.text === "הצעת מחיר חדשה");
  try {
    await act(() => view.router.navigate(basePath + "?tab=quotations"));
    assert.equal(createButtons().length, 0);
    await act(() =>
      setSession({
        ...readSession,
        user: {
          ...readSession.user,
          permissions: [PERMISSIONS.QUOTATIONS_READ, PERMISSIONS.QUOTATIONS_CREATE],
        },
      }),
    );
    assert.equal(createButtons().length, 1);
    await act(() => view.router.navigate(basePath + "?tab=details"));
    assert.equal(createButtons().length, 0);
    await act(() => view.router.navigate(basePath + "?tab=quotations"));
    await act(() => createButtons()[0].props.onClick());
    const location = view.router.state.location;
    assert.equal(location.pathname + location.search, buildProjectQuotationCreatePath("building"));
    assert.deepEqual(location.state, { quotationReturnTo: basePath + "?tab=quotations" });
  } finally {
    await view.close();
    setSession(null);
  }
});
