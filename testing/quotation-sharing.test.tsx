import {
  hasSameIds,
  filterApartments,
  formatSharedCount,
  formatRemovalNotice,
  countRemovedApartments,
  formatApartmentPreview,
  formatSharedFromBuilding,
  buildProjectQuotationPath,
  formatApartmentChoiceLabel,
} from "../src/utilities/quotation-sharing.utility";

import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import Switch from "../src/components/Switch/Switch";
import Button from "../src/components/Button/Button";
import { quotationFixture } from "./quotation.fixture";
import CheckBox from "../src/components/CheckBox/CheckBox";
import { customerService } from "../src/services/customer.service";
import InlineError from "../src/components/InlineError/InlineError";
import { quotationService } from "../src/services/quotation.service";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import NoticeBanner from "../src/components/NoticeBanner/NoticeBanner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import QuotationEditor from "../src/pages/quotations/components/QuotationEditor";
import { isProjectQuotationPage } from "../src/utilities/guards/quotation.guard";
import type { IQuotation, IProjectQuotation } from "../src/interfaces/quotation.interface";
import { isQuotationApartmentOptions } from "../src/utilities/guards/quotation-sharing.guard";
import QuotationProjectPicker from "../src/pages/quotations/components/QuotationProjectPicker";
import QuotationCustomerPicker from "../src/pages/quotations/components/QuotationCustomerPicker";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
Reflect.set(globalThis, "window", new EventTarget());

const building = {
  id: "building",
  name: "מגדלי הבדיקה",
  code: "BL-10001",
  kind: "building" as const,
};
const apartments = [
  { apartmentId: "a4", apartmentNumber: "4", floor: 1, endCustomerName: "משפחת כהן" },
  { apartmentId: "a7", apartmentNumber: "7", floor: 2, endCustomerName: null },
  { apartmentId: "a12", apartmentNumber: "12", floor: 3, endCustomerName: "משפחת לוי" },
];
const sharedQuotation = (changes: Partial<IQuotation> = {}): IQuotation => ({
  ...quotationFixture(),
  status: "approved",
  projectId: building.id,
  primaryProject: building,
  apartmentLinks: [],
  ...changes,
});

test("preview, counts and labels follow the handoff wording", () => {
  assert.equal(formatApartmentPreview(["4", "7", "12", "15", "16"]), "דירות 4, 7, 12 +2");
  assert.equal(formatApartmentPreview(["4", "7"]), "דירות 4, 7");
  assert.equal(formatSharedCount(3), "משותפת ל-3 דירות");
  assert.equal(formatRemovalNotice(2), "שמירה תסיר את ההצעה מ-2 דירות.");
  assert.equal(formatApartmentChoiceLabel(apartments[0]), "שיתוף עם דירה 4 · קומה 1 · משפחת כהן");
  assert.equal(
    formatApartmentChoiceLabel(apartments[1]),
    "שיתוף עם דירה 7 · קומה 2 · ללא לקוח קצה",
  );
  assert.equal(formatSharedFromBuilding("BL-1"), "משותפת מבניין \u2068BL-1\u2069");
  assert.deepEqual(
    filterApartments(apartments, "לוי").map(apartment => apartment.apartmentId),
    ["a12"],
  );
  assert.deepEqual(filterApartments(apartments, "  ").length, 3);
  assert.equal(countRemovedApartments({ savedIds: ["a4", "a7"], draftIds: ["a7"] }), 1);
  assert.equal(hasSameIds(["a4", "a7"], ["a7", "a4"]), true);
});

test("building rows deep-link to the sharing card; apartment rows open the quotation", () => {
  const row = {
    ...quotationFixture(),
    sharedCount: 2,
    sharedFromCode: null,
    sharedApartmentNumbers: [],
  };
  const primary: IProjectQuotation = { ...row, projectRole: "primary" };
  const shared: IProjectQuotation = { ...row, projectRole: "shared", sharedFromCode: "BL-1" };
  assert.equal(buildProjectQuotationPath(primary), "/quotations/quote1#apartment-sharing");
  assert.equal(buildProjectQuotationPath(shared), "/quotations/quote1");
  assert.equal(isProjectQuotationPage({ total: 1, nextCursor: null, items: [primary] }), true);
  assert.equal(
    isProjectQuotationPage({
      total: 1,
      nextCursor: null,
      items: [{ ...primary, projectRole: "x" }],
    }),
    false,
  );
  assert.equal(isQuotationApartmentOptions({ building, apartments }), true);
  assert.equal(isQuotationApartmentOptions({ building, apartments: [{ apartmentId: 1 }] }), false);
});

const renderEditor = async (initial: IQuotation) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const router = createMemoryRouter([
    {
      path: "/",
      element: (
        <QueryClientProvider client={client}>
          <QuotationEditor editable canApprove initial={initial} />
        </QueryClientProvider>
      ),
    },
  ]);
  const state = { renderer: null as ReturnType<typeof create> | null };
  await act(async () => {
    state.renderer = create(<RouterProvider router={router} />);
  });
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  const root = () => state.renderer!.root;
  const close = async () => {
    await act(async () => state.renderer?.unmount());
    client.clear();
    router.dispose();
  };
  return { root, close };
};

const mockLookups = (base: IQuotation) => [
  mock.method(customerService, "getByFilter", async () => []),
  mock.method(customerService, "getById", async () => ({ id: base.customerId, name: "Customer" })),
  mock.method(quotationService, "projectChoices", async () => []),
  mock.method(quotationService, "apartmentOptions", async () => ({ building, apartments })),
];

const button = (root: () => ReturnType<typeof create>["root"], text: string) =>
  root()
    .findAllByType(Button)
    .find(node => node.props.text === text);

test("approved building quotation shares selected apartments without a content save", async () => {
  const base = sharedQuotation();
  const mocks = mockLookups(base);
  const save = mock.method(quotationService, "save", async () => base);
  const setLinks = mock.method(quotationService, "setApartmentLinks", async () => ({
    ...base,
    apartmentLinks: [{ ...apartments[0], available: true }],
  }));
  const view = await renderEditor(base);
  try {
    const sharingSwitch = view.root().findByType(Switch);
    assert.equal(sharingSwitch.props.disabled, false);
    await act(() => sharingSwitch.props.onChange(true));
    assert.equal(button(view.root, "שמירת שיתוף")?.props.disabled, true);
    const rows = view.root().findAllByType(CheckBox);
    assert.equal(rows[0].props.text, "בחירת כל הדירות (3)");
    const four = rows.find(row => row.props.ariaLabel === "שיתוף עם דירה 4 · קומה 1 · משפחת כהן");
    await act(() => four!.props.onChange(true));
    await act(() => button(view.root, "שמירת שיתוף")!.props.onClick());
    assert.deepEqual(setLinks.mock.calls[0].arguments, ["quote1", ["a4"], []]);
    assert.equal(save.mock.callCount(), 0);
    const statuses = view.root().findAll(node => node.props.role === "status");
    assert.ok(statuses.some(node => node.children.includes("השיתוף נשמר")));
    for (const picker of [QuotationProjectPicker, QuotationCustomerPicker]) {
      assert.equal(
        view.root().findByType(picker).props.lockedReason,
        "יש להסיר את השיתוף עם הדירות לפני החלפת פרויקט או לקוח",
      );
    }
  } finally {
    await view.close();
    [...mocks, save, setLinks].forEach(method => method.mock.restore());
  }
});

test("turning sharing off warns, relabels save and sends an empty list", async () => {
  const base = sharedQuotation({
    apartmentLinks: [
      { ...apartments[0], available: true },
      { ...apartments[1], available: false },
    ],
  });
  const mocks = mockLookups(base);
  const setLinks = mock.method(quotationService, "setApartmentLinks", async () => ({
    ...base,
    apartmentLinks: [],
  }));
  const view = await renderEditor(base);
  try {
    await act(() => view.root().findByType(Switch).props.onChange(false));
    assert.equal(
      view.root().findByType(NoticeBanner).props.title,
      "שמירה תסיר את ההצעה מ-2 דירות.",
    );
    await act(() => button(view.root, "הסרת שיתוף")!.props.onClick());
    assert.deepEqual(setLinks.mock.calls[0].arguments, ["quote1", [], ["a4", "a7"]]);
    assert.equal(view.root().findByType(QuotationProjectPicker).props.lockedReason, null);
  } finally {
    await view.close();
    [...mocks, setLinks].forEach(method => method.mock.restore());
  }
});

test("draft quotations keep links but lock the switch with a described caption", async () => {
  const base = sharedQuotation({
    status: "draft",
    apartmentLinks: [{ ...apartments[0], available: true }],
  });
  const mocks = mockLookups(base);
  const view = await renderEditor(base);
  try {
    const sharingSwitch = view.root().findByType(Switch);
    assert.equal(sharingSwitch.props.disabled, true);
    assert.equal(sharingSwitch.props.value, true);
    assert.equal(sharingSwitch.props.describedBy, "apartment-sharing-caption");
    const [caption] = view.root().findAll(node => node.props.id === "apartment-sharing-caption");
    assert.equal(caption.props.children, "אפשר לשתף עם דירות לאחר אישור ההצעה.");
  } finally {
    await view.close();
    mocks.forEach(method => method.mock.restore());
  }
});

test("non-building quotations render no sharing card", async () => {
  const base = { ...quotationFixture(), primaryProject: null, apartmentLinks: [] };
  const mocks = mockLookups(base);
  const view = await renderEditor(base);
  try {
    assert.equal(view.root().findAllByType(Switch).length, 0);
  } finally {
    await view.close();
    mocks.forEach(method => method.mock.restore());
  }
});

test("turning off a share whose links are all unavailable still warns and removes them", async () => {
  const base = sharedQuotation({ apartmentLinks: [{ ...apartments[2], available: false }] });
  const mocks = mockLookups(base);
  const setLinks = mock.method(quotationService, "setApartmentLinks", async () => ({
    ...base,
    apartmentLinks: [],
  }));
  const view = await renderEditor(base);
  try {
    assert.equal(view.root().findAllByType(NoticeBanner).length, 0);
    await act(() => view.root().findByType(Switch).props.onChange(false));
    assert.equal(
      view.root().findByType(NoticeBanner).props.title,
      "שמירה תסיר את ההצעה מ-1 דירות.",
    );
    await act(() => button(view.root, "הסרת שיתוף")!.props.onClick());
    assert.deepEqual(setLinks.mock.calls[0].arguments, ["quote1", [], ["a12"]]);
  } finally {
    await view.close();
    [...mocks, setLinks].forEach(method => method.mock.restore());
  }
});

test("removing one available link keeps unavailable links and counts only the removal", async () => {
  const base = sharedQuotation({
    apartmentLinks: [
      { ...apartments[0], available: true },
      { ...apartments[1], available: true },
      { ...apartments[2], available: false },
    ],
  });
  const mocks = mockLookups(base);
  const setLinks = mock.method(quotationService, "setApartmentLinks", async () => base);
  const view = await renderEditor(base);
  try {
    const seven = view
      .root()
      .findAllByType(CheckBox)
      .find(row => row.props.ariaLabel === "שיתוף עם דירה 7 · קומה 2 · ללא לקוח קצה");
    await act(() => seven!.props.onChange(false));
    assert.equal(
      view.root().findByType(NoticeBanner).props.title,
      "שמירה תסיר את ההצעה מ-1 דירות.",
    );
    await act(() => button(view.root, "שמירת שיתוף")!.props.onClick());
    assert.deepEqual(setLinks.mock.calls[0].arguments, [
      "quote1",
      ["a4", "a12"],
      ["a4", "a7", "a12"],
    ]);
  } finally {
    await view.close();
    [...mocks, setLinks].forEach(method => method.mock.restore());
  }
});

test("removing the last available link preserves an unavailable link", async () => {
  const base = sharedQuotation({
    apartmentLinks: [
      { ...apartments[0], available: true },
      { ...apartments[2], available: false },
    ],
  });
  const mocks = mockLookups(base);
  const setLinks = mock.method(quotationService, "setApartmentLinks", async () => ({
    ...base,
    apartmentLinks: [{ ...apartments[2], available: false }],
  }));
  const view = await renderEditor(base);
  try {
    const four = view
      .root()
      .findAllByType(CheckBox)
      .find(row => row.props.ariaLabel === "שיתוף עם דירה 4 · קומה 1 · משפחת כהן");
    await act(() => four!.props.onChange(false));
    assert.equal(button(view.root, "שמירת שיתוף")?.props.disabled, false);
    await act(() => button(view.root, "שמירת שיתוף")!.props.onClick());
    assert.deepEqual(setLinks.mock.calls[0].arguments, ["quote1", ["a12"], ["a4", "a12"]]);
  } finally {
    await view.close();
    [...mocks, setLinks].forEach(method => method.mock.restore());
  }
});

test("cancel restores the saved selection and switch state", async () => {
  const base = sharedQuotation({ apartmentLinks: [{ ...apartments[0], available: true }] });
  const mocks = mockLookups(base);
  const view = await renderEditor(base);
  const checked = () =>
    view
      .root()
      .findAllByType(CheckBox)
      .filter(row => row.props.ariaLabel && row.props.value)
      .map(row => row.props.ariaLabel);
  try {
    const seven = () =>
      view
        .root()
        .findAllByType(CheckBox)
        .find(row => row.props.ariaLabel === "שיתוף עם דירה 7 · קומה 2 · ללא לקוח קצה");
    await act(() => seven()!.props.onChange(true));
    assert.equal(checked().length, 2);
    await act(() => button(view.root, "ביטול")!.props.onClick());
    assert.deepEqual(checked(), ["שיתוף עם דירה 4 · קומה 1 · משפחת כהן"]);
    await act(() => view.root().findByType(Switch).props.onChange(false));
    await act(() => button(view.root, "ביטול")!.props.onClick());
    assert.equal(view.root().findByType(Switch).props.value, true);
  } finally {
    await view.close();
    mocks.forEach(method => method.mock.restore());
  }
});

test("a failed save shows the error and keeps both the draft and the saved state", async () => {
  const base = sharedQuotation();
  const mocks = mockLookups(base);
  const setLinks = mock.method(quotationService, "setApartmentLinks", async () => {
    throw new Error("השמירה נכשלה");
  });
  const view = await renderEditor(base);
  try {
    await act(() => view.root().findByType(Switch).props.onChange(true));
    const four = view
      .root()
      .findAllByType(CheckBox)
      .find(row => row.props.ariaLabel === "שיתוף עם דירה 4 · קומה 1 · משפחת כהן");
    await act(() => four!.props.onChange(true));
    await act(() => button(view.root, "שמירת שיתוף")!.props.onClick());
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    assert.equal(setLinks.mock.callCount(), 1);
    assert.equal(view.root().findAllByType(InlineError).length, 1);
    assert.equal(
      view
        .root()
        .findAll(node => node.props.role === "status" && node.props.children === "השיתוף נשמר")
        .length,
      0,
    );
    assert.equal(view.root().findByType(Switch).props.value, true);
    assert.equal(four!.props.value, true);
    assert.equal(view.root().findByType(QuotationProjectPicker).props.lockedReason, null);
  } finally {
    await view.close();
    [...mocks, setLinks].forEach(method => method.mock.restore());
  }
});
