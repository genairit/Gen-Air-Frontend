import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { catalogueLine } from "../src/utilities/quotation.utility";
import { quotationFixture, catalogueFixture } from "./quotation.fixture";
import { quotationDraftTotals } from "../src/utilities/quotation-document.utility";
import { isQuotationDocumentContext } from "../src/utilities/guards/quotation-document.guard";
import QuotationDocumentItems from "../src/pages/quotations/components/QuotationDocumentItems";
import type { IQuotationDocumentContext } from "../src/interfaces/quotation-document.interface";
import QuotationDocumentHeader from "../src/pages/quotations/components/QuotationDocumentHeader";
import QuotationDocumentFooter from "../src/pages/quotations/components/QuotationDocumentFooter";

const party = {
  name: "Saved recipient",
  address: "21 Sample Street",
  city: null,
  phone: null,
  email: null,
};
const context: IQuotationDocumentContext = {
  title: "הצעת מחיר",
  issuerName: "Engineer",
  printDate: "28.11.2026",
  company: {
    ...party,
    name: "GENAIR",
    address: "Office",
    businessNumber: "1234",
    vatFileNumber: "9876",
  },
  recipient: { ...party, customerNumber: "C101" },
  recipientContext: { customerId: "customer1", projectId: null, salesAgentId: null },
  project: { name: null, address: null },
  metadata: {
    validUntil: null,
    customerTaxId: "CID555",
    customerTaxLabel: "מספר",
    vatFileNumber: "9876",
    salesAgent: null,
  },
  terms: {
    approval: "Approval terms",
    general: ["Terms for all"],
    delivery: [],
    additional: [],
    warranty: [],
  },
  defaultPayment: ["Default payment", "Unchanged paragraph"],
  paymentTermLabels: { prepaid: "Prepaid in full" },
};

test("price extension rounds each line before applying discount, target and VAT", () => {
  const quotation = quotationFixture();
  const line = catalogueLine(catalogueFixture(), null);
  quotation.sections = [
    {
      id: "s",
      title: "System",
      systemType: "VRF",
      brand: quotation.brand,
      items: [line, { ...line, id: "two" }],
    },
  ];
  quotation.discountPercent = "10";
  assert.deepEqual(quotationDraftTotals(quotation), {
    subtotal: "20.02",
    discount: "2.00",
    pretax: "18.02",
    vat: "3.24",
    total: "21.26",
  });
  quotation.targetPretaxAmount = "20.03";
  assert.deepEqual(quotationDraftTotals(quotation), {
    subtotal: "20.02",
    discount: "-0.01",
    pretax: "20.03",
    vat: "3.61",
    total: "23.64",
  });
  quotation.sections[0].items[1].quantity = "";
  assert.equal(quotationDraftTotals(quotation).subtotal, "10.01");
});

test("customer paper includes projected recipients, current grouped rows, payment terms and draft totals", () => {
  const quotation = quotationFixture();
  const line = { ...catalogueLine(catalogueFixture(), null), quantity: "2" };
  quotation.sections = [
    {
      id: "s",
      title: "Lobby system",
      systemType: "VRF",
      brand: quotation.brand,
      floorId: "1",
      floorName: "First floor",
      items: [line],
    },
  ];
  quotation.internalNotes = "Confidential staff note";
  quotation.totals = quotationDraftTotals(quotation);
  quotation.paymentTermsNote = "Current draft note";
  const paper = renderToStaticMarkup(
    <>
      <QuotationDocumentHeader context={context} quotation={quotation} />
      <QuotationDocumentItems quotation={quotation} />
      <QuotationDocumentFooter context={context} quotation={quotation} />
    </>,
  );
  for (const value of [
    party.name,
    party.address,
    "C101",
    "CID555",
    "First floor",
    "Lobby system",
    line.sku,
    "20.01",
    quotation.totals.total,
    "Current draft note",
    "Unchanged paragraph",
    "Prepaid in full",
    "Approval terms",
  ])
    assert.ok(paper.includes(value));
  assert.ok(!paper.includes("Default payment"));
  assert.ok(!paper.includes(quotation.internalNotes));
  assert.ok(paper.indexOf("First floor") < paper.indexOf("Lobby system"));
});

test("changing the customer clears the previous recipient and tax details before metadata arrives", () => {
  const quotation = { ...quotationFixture(), customerId: "new", customerName: "New recipient" };
  const paper = renderToStaticMarkup(
    <>
      <QuotationDocumentHeader context={context} quotation={quotation} />
      <QuotationDocumentFooter context={context} quotation={quotation} />
    </>,
  );
  assert.ok(paper.includes("New recipient"));
  for (const value of [party.name, party.address, "C101", "CID555"])
    assert.ok(!paper.includes(value));
  assert.ok(isQuotationDocumentContext(context));
  assert.ok(!isQuotationDocumentContext({ ...context, defaultPayment: 42 }));
});
