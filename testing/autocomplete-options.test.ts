import { test } from "node:test";
import assert from "node:assert/strict";
import { getVisibleSearchOptions } from "../src/vendor/smartbase/components/Autocomplete/utilities/autocomplete.utility";

test("server-filtered autocomplete keeps every returned result, including duplicate labels", () => {
  const results = [
    { value: "first", label: "שם זהה" },
    { value: "second", label: "שם זהה" },
  ];

  assert.deepEqual(getVisibleSearchOptions(results, "unrelated query", false), results);
  assert.deepEqual(getVisibleSearchOptions(results, "שם זהה", true), results);
  assert.deepEqual(getVisibleSearchOptions(results, "unrelated query", true), []);
});
