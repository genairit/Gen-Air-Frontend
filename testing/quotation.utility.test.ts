import {
  catalogueLine,
  quotationMoney,
  quotationPayload,
  removeQuotationLine,
  moveQuotationSection,
} from "../src/utilities/quotation.utility";

import { test } from "node:test";
import assert from "node:assert/strict";
import { quotationFixture, catalogueFixture } from "./quotation.fixture";
import { isQuotation, isCatalogueItem } from "../src/utilities/guards/quotation.guard";

test("quotation response guard rejects malformed snapshots, totals and warning payloads", () => {
  const quotation = quotationFixture();
  assert.ok(isQuotation(quotation));
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
test("catalogue response guard rejects invalid price and included-controller metadata", () => {
  const item = catalogueFixture();
  assert.ok(isCatalogueItem(item));
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
