import ts from "typescript";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && context.parentURL) {
      for (const suffix of [".ts", "/index.ts"]) {
        const url = new URL(specifier + suffix, context.parentURL);
        if (existsSync(url)) return { url: url.href, shortCircuit: true };
      }
    }
    try {
      return next(specifier, context);
    } catch (error) {
      if (error.code !== "ERR_MODULE_NOT_FOUND") throw error;
      return next(`${specifier}.js`, context);
    }
  },
  load(url, context, next) {
    if (url.endsWith(".ts"))
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
        }).outputText,
      };
    return next(url, context);
  },
});
const { formatPriorityId, formatCustomerTaxId, getCustomerSyncSteps, countCustomersForFilter } =
  await import("../src/utilities/customer.utility.ts");
const { isApiCustomer, isCustomerSyncStatusCounts } =
  await import("../src/utilities/guards/api.guard.ts");
const { CUSTOMER_SYNC_FILTERS } = await import("../src/constants/customer.constant.ts");

const CUSTOMER = {
  id: "customer-1",
  name: "עמותת אור לנוער",
  phone: "03-5551204",
  email: "ron@or.test",
  taxId: "580123453",
  address: "ויצמן 3, כפר סבא",
  createdAt: "2026-10-13T08:00:00.000Z",
  contactName: "רון שמש",
  priorityId: null,
  prioritySyncAttempts: 3,
  prioritySyncedAt: null,
  prioritySyncError: "Priority לא הגיב",
  customerType: "institution",
  prioritySyncStatus: "failed",
};

const COUNTS = { failed: 2, synced: 6, pending: 1 };

test("accepts a customer from the API and rejects malformed ones", () => {
  assert.equal(isApiCustomer(CUSTOMER), true);
  assert.equal(isApiCustomer({ ...CUSTOMER, prioritySyncStatus: "unknown" }), false);
  assert.equal(isApiCustomer({ ...CUSTOMER, customerType: "shop" }), false);
  assert.equal(isApiCustomer({ ...CUSTOMER, prioritySyncAttempts: "3" }), false);
  assert.equal(isApiCustomer({ ...CUSTOMER, createdBy: { id: "x" } }), false);
});

test("validates sync status counts", () => {
  assert.equal(isCustomerSyncStatusCounts(COUNTS), true);
  assert.equal(isCustomerSyncStatusCounts({ failed: 1, synced: 2 }), false);
});

test("labels the tax id by customer type and falls back for a missing Priority id", () => {
  assert.equal(formatCustomerTaxId(CUSTOMER), "מ״ע 580123453");
  assert.equal(
    formatCustomerTaxId({ ...CUSTOMER, customerType: "private_client" }),
    "ת.ז 580123453",
  );
  assert.equal(formatPriorityId(CUSTOMER), "ללא מזהה Priority");
  assert.equal(formatPriorityId({ ...CUSTOMER, priorityId: "PR-1" }), "PR-1");
});

test("counts customers per sync tab, summing all statuses for the all tab", () => {
  const counts = CUSTOMER_SYNC_FILTERS.map(filter => countCustomersForFilter(COUNTS, filter));

  assert.deepEqual(counts, [9, 6, 1, 2]);
  assert.equal(countCustomersForFilter(null, CUSTOMER_SYNC_FILTERS[0]), 0);
});

test("builds the Priority step from the sync status and keeps the CRM step done", () => {
  const stateOf = status =>
    getCustomerSyncSteps({ ...CUSTOMER, prioritySyncStatus: status, priorityId: "PR-7" });

  assert.deepEqual(
    stateOf("synced").map(step => step.state),
    ["done", "done"],
  );
  assert.equal(stateOf("synced")[0].caption, "מזהה PR-7");
  assert.deepEqual(
    stateOf("pending").map(step => step.state),
    ["active", "done"],
  );
  assert.deepEqual(
    stateOf("failed").map(step => step.state),
    ["failed", "done"],
  );
  assert.equal(stateOf("failed")[0].caption, "נכשל · 3 ניסיונות סנכרון");
});
