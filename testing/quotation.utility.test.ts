import {
  catalogueLine,
  quotationMoney,
  quotationPayload,
  removeQuotationLine,
  moveQuotationSection,
} from "../src/utilities/quotation.utility";

import {
  QUOTATION_STATUS,
  QUOTATION_SYSTEM,
  QUOTATION_ALL_TAB_ID,
  QUOTATION_CONFIRMATION,
  QUOTATION_CANCELLATION_KIND,
} from "../src/constants/quotation.constant";

import {
  isQuotation,
  isCatalogueItem,
  isQuotationStatusCounts,
} from "../src/utilities/guards/quotation.guard";

import {
  quotationPaymentLabel,
  quotationHasPaymentConflict,
  selectQuotationPaymentStages,
  changeQuotationPaymentSchedule,
} from "../src/utilities/quotation-payment.utility";

import {
  quotationCancellationView,
  quotationCancellationTimeline,
} from "../src/utilities/quotation-cancellation.utility";

import { test } from "node:test";
import assert from "node:assert/strict";
import { quotationFixture, catalogueFixture } from "./quotation.fixture";
import { quotationReviewSections } from "../src/utilities/quotation-presentation.utility";
import type { IQuotation, IQuotationStatusCounts } from "../src/interfaces/quotation.interface";

test("quotation response guard rejects malformed snapshots, totals and warning payloads", () => {
  const quotation = quotationFixture();
  assert.ok(isQuotation(quotation));
  assert.ok(isQuotation({ ...quotation, salesAgentName: "Neta Levi · 008" }));
  assert.equal(isQuotation({ ...quotation, salesAgentName: { firstName: "Neta" } }), false);
  assert.equal(isQuotation({ ...quotation, totals: { total: "NaN" } }), false);
  assert.equal(
    isQuotation({
      ...quotation,
      sections: [{ id: "s", title: "s", systemType: "VRF", items: [{ id: "bad" }] }],
    }),
    false,
  );
  assert.equal(
    isQuotation({ ...quotation, warnings: [{ key: "x", text: "warning", acknowledged: "yes" }] }),
    false,
  );
});
test("quotation cancellation history and status counts are validated", () => {
  const quotation = quotationFixture();
  const cancelled: IQuotation = {
    ...quotation,
    status: QUOTATION_STATUS.CANCELLED,
    cancelledFromStatus: QUOTATION_STATUS.REVIEW,
    cancellationHistory: [
      {
        kind: QUOTATION_CANCELLATION_KIND.MANUAL,
        fromStatus: QUOTATION_STATUS.REVIEW,
        cancelledAt: "2026-10-31T12:00:00.000Z",
        cancelledById: "user-1",
        cancelledByName: "Dana Cohen",
        reason: "Project withdrawn",
        restoredAt: null,
        restoredById: null,
        restoredByName: null,
      },
    ],
  };
  assert.ok(isQuotation(cancelled));
  assert.equal(
    isQuotation({
      ...cancelled,
      cancellationHistory: [{ ...cancelled.cancellationHistory[0], reason: "   " }],
    }),
    false,
  );
  assert.deepEqual(
    quotationCancellationTimeline([
      ...cancelled.cancellationHistory,
      {
        ...cancelled.cancellationHistory[0],
        restoredAt: "2026-10-31T13:00:00.000Z",
        restoredById: "user-2",
        restoredByName: "Rina Levy",
      },
    ]).map(entry => [entry.label, entry.author]),
    [
      ["שחזור הצעה", "Rina Levy"],
      ["ביטול הצעה", "Dana Cohen · סיבה: Project withdrawn"],
      ["ביטול הצעה", "Dana Cohen · סיבה: Project withdrawn"],
    ],
  );
  assert.equal(
    quotationCancellationView(
      { ...cancelled, cancelledFromStatus: QUOTATION_STATUS.APPROVED },
      QUOTATION_CONFIRMATION.RESTORE,
    ).title,
    "שחזור הזמנה",
  );
  assert.equal(
    quotationCancellationView(
      { ...quotation, status: QUOTATION_STATUS.APPROVED },
      QUOTATION_CONFIRMATION.CANCEL,
    ).title,
    "ביטול הזמנה",
  );
  assert.equal(
    quotationCancellationView(quotation, QUOTATION_CONFIRMATION.CANCEL).title,
    "ביטול הצעה",
  );
  assert.equal(
    isQuotation({ ...cancelled, cancelledFromStatus: QUOTATION_STATUS.CANCELLED }),
    false,
  );
  assert.ok(isQuotationStatusCounts({ all: 4, draft: 1, review: 1, approved: 1, cancelled: 1 }));
  assert.equal(
    isQuotationStatusCounts({ all: 3, draft: 1, review: 1, approved: 1, cancelled: 1 }),
    false,
  );
});
test("payment stages replace a copied fixed term without losing the quotation note", () => {
  const quotation = { ...quotationFixture(), paymentTermsNote: "Keep this note" };
  const staged = selectQuotationPaymentStages(quotation);
  assert.equal(staged.paymentTerms, null);
  assert.equal(staged.paymentTermsNote, "Keep this note");
  assert.deepEqual(staged.paymentSchedule, [{ percent: "0", text: "" }]);
  assert.equal(quotationPaymentLabel(staged), "לפי שלבי תשלום");
  const conflicted = { ...staged, paymentTerms: "prepaid" };
  assert.equal(quotationHasPaymentConflict(conflicted), true);
  assert.equal(quotationPaymentLabel(conflicted), "יש לבחור בין תנאי תשלום קבועים לשלבי תשלום");
  assert.equal(
    changeQuotationPaymentSchedule(conflicted, staged.paymentSchedule).paymentTerms,
    null,
  );
});
test("catalogue response guard rejects invalid price and included-controller metadata", () => {
  const item = catalogueFixture();
  assert.ok(isCatalogueItem(item));
  assert.ok(isCatalogueItem({ ...item, brand: "", systemType: "" }));
  assert.equal(isCatalogueItem({ ...item, price: 10 }), false);
  assert.equal(isCatalogueItem({ ...item, includesRemote: "true" }), false);
});
test("each catalogue selection receives independent line identity and snapshot", () => {
  const item = catalogueFixture();
  const a = catalogueLine(item, 30000),
    b = catalogueLine(item, 30000);
  assert.notEqual(a.id, b.id);
  assert.equal(a.catalogueItemId, b.catalogueItemId);
  item.description = "changed";
  item.price = "999";
  assert.equal(a.description, "ציוד");
  assert.equal(a.quotedPrice, "10.0050");
  assert.equal(a.includesRemote, true);
});
test("save payload preserves repeated lines and omits server-controlled money/status/identity metadata", () => {
  const quotation = quotationFixture();
  const a = catalogueLine(catalogueFixture(), null),
    b = catalogueLine(catalogueFixture(), null);
  quotation.sections = [{ id: "s", title: "קומה", systemType: "VRF", items: [a, b] }];
  const body = quotationPayload({ ...quotation, status: "approved", version: 7 });
  assert.equal(body.version, 7);
  assert.equal(body.salesAgentId, null);
  assert.equal(body.sections[0].items.length, 2);
  assert.equal("status" in body, false);
  assert.equal("vatRate" in body, false);
  assert.equal("totals" in body, false);
  assert.equal("sku" in body.sections[0].items[0], false);
  assert.equal("includesRemote" in body.sections[0].items[0], false);
});
test("removing a unit also removes its linked controls, preserving unrelated repeated item", () => {
  const parent = catalogueLine(catalogueFixture(), null);
  const control = { ...catalogueLine(catalogueFixture(), null), parentItemId: parent.id };
  const other = catalogueLine(catalogueFixture(), null);
  const section = removeQuotationLine(
    { id: "s", title: "", systemType: "VRF", items: [parent, control, other] },
    parent.id,
  );
  assert.deepEqual(section.items, [other]);
});
test("section reordering preserves identities and bounds", () => {
  const quotation = quotationFixture();
  quotation.sections = [
    { id: "a", title: "א", systemType: "GEN", items: [] },
    { id: "b", title: "ב", systemType: "GEN", items: [] },
  ];
  assert.deepEqual(
    moveQuotationSection(quotation, 0, 1).sections.map(section => section.id),
    ["b", "a"],
  );
  assert.equal(moveQuotationSection(quotation, 0, -1), quotation);
});
test("brand tabs persist with section ownership and reordering stays inside a tab", () => {
  const quotation = quotationFixture();
  quotation.brands = ["אלקטרה", "תדיראן"];
  quotation.sections = [
    { id: "a", title: "A", systemType: "VRF", brand: "אלקטרה", items: [] },
    { id: "b", title: "B", systemType: QUOTATION_SYSTEM.GENERAL, brand: null, items: [] },
    { id: "c", title: "C", systemType: "VRF", brand: "תדיראן", items: [] },
    { id: "d", title: "D", systemType: QUOTATION_SYSTEM.GENERAL, brand: "אלקטרה", items: [] },
  ];
  assert.deepEqual(
    moveQuotationSection(quotation, 0, 1).sections.map(section => section.id),
    ["d", "b", "c", "a"],
  );
  assert.equal(moveQuotationSection(quotation, 1, 1), quotation);
  const body = quotationPayload(quotation);
  assert.deepEqual(body.brands, ["אלקטרה", "תדיראן"]);
  assert.deepEqual(
    body.sections.map(section => section.brand),
    ["אלקטרה", null, "תדיראן", "אלקטרה"],
  );
  assert.deepEqual(
    quotationReviewSections(quotation).map(section => section.id),
    ["a", "d", "c", "b"],
  );
});
test("financial formatting retains cents beyond JavaScript safe integer precision", () => {
  const rendered = quotationMoney("10821521067063092717.57");
  assert.ok(rendered.includes(".57"), rendered);
  assert.ok(rendered.includes("10,821,521,067,063,092,717"), rendered);
});

test("linked controller quantities follow changes to their parent unit", async () => {
  const { updateQuotationLine } = await import("../src/utilities/quotation.utility");
  const parent = catalogueLine(catalogueFixture(), null);
  const control = { ...catalogueLine(catalogueFixture(), null), parentItemId: parent.id };
  const section = updateQuotationLine(
    { id: "s", title: "", systemType: "VRF", items: [parent, control] },
    { ...parent, quantity: "3" },
  );
  assert.equal(section.items[1].quantity, "3");
});

test("brand replacement preserves IDs, quantities, locations and recalculates selection snapshots", async () => {
  const { mock } = await import("node:test");
  const { quotationService } = await import("../src/services/quotation.service");
  const { rebrandQuotationAction } = await import("../src/actions/quotation-rebrand.action");
  const original = catalogueFixture();
  const quotation = quotationFixture();
  const line = { ...catalogueLine(original, 24000), quantity: "2", location: "סלון" };
  quotation.sections = [{ id: "s", title: "קומה", systemType: "VRF", items: [line] }];
  const replacement = { ...original, id: "new", sku: "NEW", brand: "תדיראן", price: "20" };
  const originalRead = mock.method(quotationService, "catalogueItem", async () => original);
  const search = mock.method(quotationService, "catalogue", async () => [replacement]);
  try {
    const changed = await rebrandQuotationAction(quotation, "תדיראן");
    assert.equal(changed.brand, "תדיראן");
    assert.equal(changed.sections[0].items[0].id, line.id);
    assert.equal(changed.sections[0].items[0].quantity, "2");
    assert.equal(changed.sections[0].items[0].location, "סלון");
    assert.equal(changed.sections[0].items[0].catalogueItemId, "new");
    assert.equal(quotation.brand, "אלקטרה");
  } finally {
    search.mock.restore();
    originalRead.mock.restore();
  }
});

test("unmatched brand replacement leaves the original quotation intact; no000 line", async () => {
  const { mock } = await import("node:test");
  const { quotationService } = await import("../src/services/quotation.service");
  const { rebrandQuotationAction } = await import("../src/actions/quotation-rebrand.action");
  const quotation = quotationFixture();
  const line = catalogueLine(catalogueFixture(), 24000);
  quotation.sections = [{ id: "s", title: "", systemType: "VRF", items: [line] }];
  const before = structuredClone(quotation);
  const originalRead = mock.method(quotationService, "catalogueItem", async () =>
    catalogueFixture(),
  );
  const search = mock.method(quotationService, "catalogue", async () => []);
  try {
    await assert.rejects(rebrandQuotationAction(quotation, "תדיראן"), /לא נמצא פריט תואם/);
    assert.deepEqual(quotation, before);
  } finally {
    search.mock.restore();
    originalRead.mock.restore();
  }
});

test("negative sub-shekel financial adjustments keep their sign", () => {
  assert.equal(quotationMoney("-0.57"), "-₪0.57");
  assert.equal(quotationMoney("0.57"), "₪0.57");
  assert.equal(quotationMoney("-0"), "₪0.00");
});
test("enum guards reject array-valued status, system and control kinds", () => {
  const quotation = quotationFixture();
  assert.equal(isQuotation({ ...quotation, status: ["draft"] }), false);
  assert.equal(isCatalogueItem({ ...catalogueFixture(), systemType: ["VRF"] }), false);
  const line = catalogueLine(catalogueFixture(), 24000);
  const malformed = {
    ...quotation,
    sections: [
      { id: "s", title: "", systemType: "VRF", items: [{ ...line, controlKind: ["remote"] }] },
    ],
  };
  assert.equal(isQuotation(malformed), false);
});
test("brand-independent accessories retain their exact identity outside capped suggestions", async () => {
  const { mock } = await import("node:test");
  const { quotationService } = await import("../src/services/quotation.service");
  const { rebrandQuotationAction } = await import("../src/actions/quotation-rebrand.action");
  const generic = {
    ...catalogueFixture(),
    brand: "",
    equipmentRole: "other",
    description: "שסתום כללי",
  };
  const quotation = quotationFixture();
  const line = catalogueLine(generic, null);
  quotation.sections = [{ id: "s", title: "", systemType: "GEN", items: [line] }];
  const originalRead = mock.method(quotationService, "catalogueItem", async () => generic);
  const search = mock.method(quotationService, "catalogue", async () => [
    { ...generic, id: "unrelated", description: "עבודת התקנה" },
  ]);
  try {
    const result = await rebrandQuotationAction(quotation, "תדיראן");
    assert.equal(result.sections[0].items[0].catalogueItemId, generic.id);
    assert.equal(result.sections[0].items[0].description, "שסתום כללי");
    assert.equal(search.mock.callCount(), 0);
  } finally {
    originalRead.mock.restore();
    search.mock.restore();
  }
});
test("brand replacement drops an included remote before attempting a nonexistent remote replacement", async () => {
  const { mock } = await import("node:test");
  const { quotationService } = await import("../src/services/quotation.service");
  const { rebrandQuotationAction } = await import("../src/actions/quotation-rebrand.action");
  const original = { ...catalogueFixture(), includesRemote: false };
  const parent = catalogueLine(original, 24000);
  const remote = {
    ...catalogueLine(
      { ...original, id: "remote", description: "שלט", equipmentRole: "control" },
      null,
    ),
    parentItemId: parent.id,
  };
  const quotation = quotationFixture();
  quotation.sections = [{ id: "s", title: "", systemType: "VRF", items: [parent, remote] }];
  const originalRead = mock.method(quotationService, "catalogueItem", async () => original);
  const search = mock.method(quotationService, "catalogue", async query =>
    query.equipmentRole === "indoor"
      ? [{ ...original, id: "replacement", brand: "תדיראן", includesRemote: true }]
      : [],
  );
  try {
    const result = await rebrandQuotationAction(quotation, "תדיראן");
    assert.equal(result.sections[0].items.length, 1);
    assert.equal(result.sections[0].items[0].id, parent.id);
    assert.equal(result.sections[0].items[0].includesRemote, true);
    assert.equal(originalRead.mock.callCount(), 1);
  } finally {
    originalRead.mock.restore();
    search.mock.restore();
  }
});

test("section amounts sum independently rounded lines with exact large decimals", async () => {
  const { quotationSectionAmount } =
    await import("../src/utilities/quotation-presentation.utility");
  const line = catalogueLine(catalogueFixture(), null);
  const section = { id: "s", title: "", systemType: "GEN" as const, items: [] as (typeof line)[] };
  assert.equal(quotationSectionAmount(section), "0.00");
  section.items = [
    { ...line, quantity: "1", quotedPrice: "0.005" },
    { ...line, id: "second", quantity: "1", quotedPrice: "0.005" },
    { ...line, id: "large", quantity: "2", quotedPrice: "9007199254740993.125" },
  ];
  const before = structuredClone(section);
  assert.equal(quotationSectionAmount(section), "18014398509481986.27");
  assert.deepEqual(section, before);
});

test("VRF diagnostics isolate sections and circuits, multiply quantities and avoid division by zero", async () => {
  const { quotationCircuits } = await import("../src/utilities/quotation-presentation.utility");
  const quotation = quotationFixture();
  const indoor = {
    ...catalogueLine(catalogueFixture(), null),
    circuit: null,
    quantity: "1.5",
    capacityBtu: 10000,
  };
  const outdoor = {
    ...indoor,
    id: "outdoor",
    equipmentRole: "outdoor" as const,
    quantity: "2",
    capacityBtu: 12000,
  };
  quotation.sections = [
    {
      id: "one",
      title: "same",
      systemType: "VRF",
      items: [
        indoor,
        outdoor,
        { ...indoor, id: "b", circuit: "B", capacityBtu: null },
        { ...indoor, id: "control", equipmentRole: "control", circuit: "C" },
      ],
    },
    { id: "two", title: "same", systemType: "VRF", items: [{ ...indoor, quantity: "1" }] },
    { id: "gen", title: "", systemType: "GEN", items: [indoor] },
  ];
  const before = structuredClone(quotation);
  assert.deepEqual(quotationCircuits(quotation), [
    { id: "one:A", key: "same · A", indoor: "15000", outdoor: "24000", ratio: "0.63" },
    { id: "one:B", key: "same · B", indoor: "0", outdoor: "0", ratio: null },
    { id: "two:A", key: "same · A", indoor: "10000", outdoor: "0", ratio: null },
  ]);
  const branded = structuredClone(quotation);
  branded.brands = ["אלקטרה", "תדיראן"];
  branded.sections[0].brand = "אלקטרה";
  branded.sections[1].brand = "תדיראן";
  assert.deepEqual(
    quotationCircuits(branded).map(circuit => circuit.key),
    ["אלקטרה · same · A", "אלקטרה · same · B", "תדיראן · same · A"],
  );
  assert.deepEqual(quotation, before);
});

test("opening line selects the first general description across sections, with an empty fallback", async () => {
  const { quotationOpeningLine } = await import("../src/utilities/quotation-presentation.utility");
  const quotation = quotationFixture();
  assert.equal(quotationOpeningLine(quotation), null);
  const line = catalogueLine(catalogueFixture(), null);
  quotation.sections = [
    { id: "a", title: "", systemType: "GEN", items: [line] },
    {
      id: "b",
      title: "",
      systemType: "GEN",
      items: [
        { ...line, equipmentRole: "other", description: "פתיחה" },
        { ...line, equipmentRole: "other", description: "later" },
      ],
    },
  ];
  assert.equal(quotationOpeningLine(quotation), "פתיחה");
});

test("status counts require complete consistent nonnegative safe integer totals", async () => {
  const { isQuotationStatusCounts } = await import("../src/utilities/guards/quotation.guard");
  const emptyCounts: IQuotationStatusCounts = {
    [QUOTATION_ALL_TAB_ID]: 0,
    [QUOTATION_STATUS.DRAFT]: 0,
    [QUOTATION_STATUS.REVIEW]: 0,
    [QUOTATION_STATUS.APPROVED]: 0,
    [QUOTATION_STATUS.CANCELLED]: 0,
  };
  assert.ok(isQuotationStatusCounts(emptyCounts));
  assert.ok(
    isQuotationStatusCounts({
      ...emptyCounts,
      [QUOTATION_ALL_TAB_ID]: 6,
      [QUOTATION_STATUS.DRAFT]: 1,
      [QUOTATION_STATUS.REVIEW]: 2,
      [QUOTATION_STATUS.APPROVED]: 3,
    }),
  );
  for (const malformed of [
    null,
    [],
    {},
    { [QUOTATION_ALL_TAB_ID]: 3, [QUOTATION_STATUS.DRAFT]: 1, [QUOTATION_STATUS.REVIEW]: 1 },
    { ...emptyCounts, [QUOTATION_ALL_TAB_ID]: 1 },
  ]) {
    assert.equal(isQuotationStatusCounts(malformed), false, JSON.stringify(malformed));
  }
  const fields = [QUOTATION_ALL_TAB_ID, ...Object.values(QUOTATION_STATUS)];
  for (const field of fields) {
    for (const invalid of [-1, 0.5, "0", null, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      assert.equal(
        isQuotationStatusCounts({
          ...emptyCounts,
          [field]: invalid,
        }),
        false,
        `${field}: ${String(invalid)}`,
      );
    }
  }
});

test("decimal input formatting compacts valid decimals without coercing incomplete edits", async () => {
  const { quotationDecimalInput } = await import("../src/utilities/quotation-presentation.utility");
  for (const [value, expected] of [
    ["1.0000", "1"],
    ["001.2500", "1.25"],
    ["0.0001000", "0.0001"],
    ["-0.0000", "0"],
    ["9007199254740993.1234000", "9007199254740993.1234"],
  ]) {
    assert.equal(quotationDecimalInput(value), expected, value);
  }
  for (const partial of ["", "-", ".", "1.", "-.5", ".5", "1e3", " 1 ", "NaN", "Infinity"]) {
    assert.equal(quotationDecimalInput(partial), partial, partial);
  }
});

test("line groups preserve root and controller ordering and keep orphan controllers visible", async () => {
  const { quotationLineGroups } = await import("../src/utilities/quotation-presentation.utility");
  const first = { ...catalogueLine(catalogueFixture(), null), id: "first" };
  const second = { ...first, id: "second" };
  const control = {
    ...first,
    id: "control",
    equipmentRole: "control" as const,
    parentItemId: first.id,
  };
  const orphan = { ...control, id: "orphan", parentItemId: "missing" };
  const another = { ...control, id: "another" };
  const section = {
    id: "s",
    title: "",
    systemType: "VRF" as const,
    items: [control, second, orphan, first, another],
  };
  const before = structuredClone(section);
  assert.deepEqual(quotationLineGroups(section), [
    { line: second, controls: [] },
    { line: orphan, controls: [] },
    { line: first, controls: [control, another] },
  ]);
  assert.deepEqual(section, before);
  assert.deepEqual(quotationLineGroups({ ...section, items: [] }), []);
});

test("payment row derivation rounds exact amounts and leaves schedule entries untouched", async () => {
  const { quotationPaymentRows, quotationPaymentTotal } =
    await import("../src/utilities/quotation-presentation.utility");
  const quotation = quotationFixture();
  assert.deepEqual(quotationPaymentRows(quotation), []);
  assert.equal(quotationPaymentTotal(quotation), "0");
  quotation.totals.total = "100.05";
  quotation.paymentSchedule = [
    { percent: "10", text: "first" },
    { percent: "0.1", text: "second" },
    { percent: "", text: "editing" },
  ];
  const before = structuredClone(quotation);
  assert.deepEqual(quotationPaymentRows(quotation), [
    { percent: "10", text: "first", amount: "₪10.01" },
    { percent: "0.1", text: "second", amount: "₪0.10" },
    { percent: "", text: "editing", amount: "₪0.00" },
  ]);
  assert.equal(quotationPaymentTotal(quotation), "10.1");
  assert.deepEqual(quotation, before);
});
