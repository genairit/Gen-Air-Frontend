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
    return next(specifier, context);
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
const { getVisiblePaginationItems } = await import("../src/utilities/pagination.utility.ts");
const { PAGINATION } = await import("../src/constants/pagination.constant.ts");

const GAP = PAGINATION.GAP;

test("a few pages are all shown without gaps", () => {
  assert.deepEqual(getVisiblePaginationItems({ page: 1, pageCount: 1 }), [1]);
  assert.deepEqual(getVisiblePaginationItems({ page: 2, pageCount: 3 }), [1, 2, 3]);
});

test("many pages collapse to the edges and the current page's neighbours", () => {
  assert.deepEqual(getVisiblePaginationItems({ page: 9, pageCount: 18 }), [
    1,
    GAP,
    8,
    9,
    10,
    GAP,
    18,
  ]);
  assert.deepEqual(getVisiblePaginationItems({ page: 1, pageCount: 18 }), [1, 2, GAP, 18]);
  assert.deepEqual(getVisiblePaginationItems({ page: 18, pageCount: 18 }), [1, GAP, 17, 18]);
});

test("the item count stays bounded however many pages there are", () => {
  const itemCounts = [10, 100, 1000].map(
    pageCount => getVisiblePaginationItems({ page: pageCount / 2, pageCount }).length,
  );

  assert.deepEqual(itemCounts, [7, 7, 7]);
});
