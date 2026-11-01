import { test } from "node:test";
import assert from "node:assert/strict";
import { performApartmentImportAction } from "../src/actions/apartment-import.action.ts";

test("returns success only after the operation resolves", async () => {
  const state = { completed: false };
  const result = await performApartmentImportAction(async () => {
    state.completed = true;
  });
  assert.equal(result, null);
  assert.equal(state.completed, true);
});

test("reports failed callbacks without rejecting the event handler", async () => {
  const result = await performApartmentImportAction(async () => {
    throw new Error("network failure");
  });
  assert.equal(typeof result, "string");
});
