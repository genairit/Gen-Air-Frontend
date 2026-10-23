import ts from "typescript";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && context.parentURL) {
      for (const suffix of [".ts", "/index.ts", ".js"]) {
        const url = new URL(specifier + suffix, context.parentURL);
        if (existsSync(url)) return { url: url.href, shortCircuit: true };
      }
    }
    const isDeepPackageImport =
      !specifier.startsWith(".") && /^[^@][^/]*\/.+[^.]{4}$/.test(specifier);

    if (isDeepPackageImport) {
      try {
        return next(specifier, context);
      } catch {
        return next(`${specifier}.js`, context);
      }
    }

    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".ts"))
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(
          readFileSync(fileURLToPath(url), "utf8").replaceAll("import.meta.env", "({})"),
          {
            compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
          },
        ).outputText,
      };
    return next(url, context);
  },
});

const keyboard = await import("../src/utilities/keyboard.utility.ts");

class FakeElement {
  focused = false;
  focus() {
    this.focused = true;
  }
}

globalThis.HTMLElement = FakeElement;

const group = () => {
  const items = [new FakeElement(), new FakeElement(), new FakeElement()];
  const parentElement = { children: { item: index => items[index] ?? null } };
  items.forEach((item, index) => {
    item.parentElement = parentElement;
    item.previousElementSibling = items[index - 1] ?? null;
    item.nextElementSibling = items[index + 1] ?? null;
  });
  return items;
};

test("only arrow keys count as arrow keys", () => {
  for (const key of ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]) {
    assert.equal(keyboard.isArrowKey(key), true);
  }
  assert.equal(keyboard.isArrowKey("Enter"), false);
  assert.equal(keyboard.isArrowKey("a"), false);
});

test("right-to-left arrows wrap within the group", () => {
  assert.equal(keyboard.wrapIndex(-1, 2), 1);
  assert.equal(keyboard.wrapIndex(2, 2), 0);
  assert.equal(keyboard.getRtlArrowTarget({ key: "ArrowLeft", index: 0, count: 2 }), 1);
  assert.equal(keyboard.getRtlArrowTarget({ key: "ArrowDown", index: 1, count: 2 }), 0);
  assert.equal(keyboard.getRtlArrowTarget({ key: "ArrowRight", index: 0, count: 3 }), 2);
  assert.equal(keyboard.getRtlArrowTarget({ key: "ArrowUp", index: 2, count: 3 }), 1);
  assert.equal(keyboard.getRtlArrowTarget({ key: "Enter", index: 0, count: 2 }), null);
});

test("focus moves to the requested group item and ignores a missing one", () => {
  const items = group();
  keyboard.focusGroupItem(items[0], 2);
  assert.equal(items[2].focused, true);
  keyboard.focusGroupItem(items[0], 9);
  assert.equal(items[1].focused, false);
});

test("vertical arrows focus the sibling option and other keys do nothing", () => {
  const items = group();
  const press = (key, element) => {
    const event = { key, currentTarget: element, prevented: false };
    event.preventDefault = () => (event.prevented = true);
    keyboard.focusSiblingOnArrow(event);
    return event;
  };

  assert.equal(press("ArrowDown", items[0]).prevented, true);
  assert.equal(items[1].focused, true);
  assert.equal(press("ArrowUp", items[2]).prevented, true);
  assert.equal(items[1].focused, true);
  assert.equal(press("ArrowUp", items[0]).prevented, false);
  assert.equal(press("Enter", items[1]).prevented, false);
});
