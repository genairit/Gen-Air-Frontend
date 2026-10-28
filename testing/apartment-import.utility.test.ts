import {
  getApartmentImportSummary,
  validateApartmentImportSelection,
} from "../src/utilities/apartment-import.utility.ts";

import { test } from "node:test";
import assert from "node:assert/strict";
import { APARTMENT_IMPORT } from "../src/constants/apartment-import.constant.ts";

test("accepts exactly one nonempty XLSX with canonical or missing browser MIME", () => {
  const canonical = new File(["workbook"], "residents.xlsx", { type: APARTMENT_IMPORT.MIME_TYPE });
  const missingMime = new File(["workbook"], "RESIDENTS.XLSX");
  assert.equal(validateApartmentImportSelection([canonical]), null);
  assert.equal(validateApartmentImportSelection([missingMime]), null);
});

test("rejects missing or multiple files", () => {
  const file = new File(["workbook"], "residents.xlsx");
  assert.notEqual(validateApartmentImportSelection([]), null);
  assert.notEqual(validateApartmentImportSelection([file, file]), null);
});

test("rejects unsupported extensions and mismatched MIME", () => {
  const wrongExtension = new File(["workbook"], "residents.xls");
  const wrongMime = new File(["workbook"], "residents.xlsx", { type: "application/pdf" });
  assert.notEqual(validateApartmentImportSelection([wrongExtension]), null);
  assert.notEqual(validateApartmentImportSelection([wrongMime]), null);
});

test("rejects empty and oversized files, accepts the exact size boundary", () => {
  const empty = new File([], "residents.xlsx");
  const maxSize = new File([new Uint8Array(APARTMENT_IMPORT.MAX_FILE_BYTES)], "residents.xlsx");
  const tooLarge = new File(
    [new Uint8Array(APARTMENT_IMPORT.MAX_FILE_BYTES + 1)],
    "residents.xlsx",
  );
  assert.notEqual(validateApartmentImportSelection([empty]), null);
  assert.equal(validateApartmentImportSelection([maxSize]), null);
  assert.notEqual(validateApartmentImportSelection([tooLarge]), null);
});

test("summarizes full, partial and empty results using actual counts", () => {
  assert.equal(
    getApartmentImportSummary({ created: 2, existing: 0, duplicate: 0, error: 0 }),
    "הייבוא הושלם בהצלחה — 2 מתוך 2 שורות נקלטו",
  );
  assert.equal(
    getApartmentImportSummary({ created: 1, existing: 1, duplicate: 1, error: 1 }),
    "1 מתוך 4 שורות נקלטו",
  );
  assert.equal(
    getApartmentImportSummary({ created: 0, existing: 0, duplicate: 0, error: 0 }),
    "לא נמצאו שורות לייבוא",
  );
});
