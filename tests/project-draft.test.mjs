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
const { saveProjectDraft, readProjectDraft, clearProjectDraft } =
  await import("../src/utilities/project-draft.utility.ts");
const { toProjectFormValues } = await import("../src/utilities/project.utility.ts");
const items = new Map();
globalThis.localStorage = {
  getItem: key => items.get(key) ?? null,
  setItem: (key, value) => items.set(key, value),
  removeItem: key => items.delete(key),
};

test("round-trip allowed fields, omit sensitive fields, isolate users and clear only owner", () => {
  items.clear();
  const values = toProjectFormValues(null);
  values.name = "Project draft";
  values.typeId = "type-1";
  values.stageId = "stage-1";
  values.assignees[Object.keys(values.assignees)[0]] = "staff-1";
  values.paymentTerms = { terms: "other", note: "sensitive payment note" };
  values.contact.contactName = "sensitive contact";
  values.customerDetails.customerCompanyNumber = "sensitive identifier";
  values.address = {
    placeId: "private-place",
    formattedAddress: "private address",
    city: "private city",
  };
  saveProjectDraft("alice", values);
  saveProjectDraft("bob", { ...values, name: "Bob draft" });
  const raw = [...items.values()].join();
  assert.equal(raw.includes("sensitive"), false);
  assert.equal(raw.includes("private"), false);
  const restored = readProjectDraft("alice");
  assert.equal(restored.name, values.name);
  assert.equal(restored.typeId, values.typeId);
  assert.equal(restored.stageId, values.stageId);
  assert.deepEqual(restored.assignees, values.assignees);
  assert.deepEqual(Object.keys(restored.assignees).sort(), [
    "engineer",
    "installer",
    "project_manager",
    "secretary",
  ]);
  assert.equal(restored.paymentTerms.terms, "other");
  assert.equal(restored.paymentTerms.note, "");
  assert.equal(restored.contact.contactName, "");
  assert.equal(restored.address, null);
  assert.equal(readProjectDraft("charlie"), null);
  assert.equal(readProjectDraft(null), null);
  clearProjectDraft("alice");
  assert.equal(readProjectDraft("alice"), null);
  assert.equal(readProjectDraft("bob").name, "Bob draft");
});

test("empty reset removes draft; malformed and incompatible drafts are ignored", () => {
  saveProjectDraft("alice", { ...toProjectFormValues(null), name: "Draft" });
  saveProjectDraft("alice", toProjectFormValues(null));
  assert.equal(readProjectDraft("alice"), null);
  for (const raw of [
    "{",
    "null",
    '{"version":2,"values":{}}',
    '{"version":1,"values":{"name":42}}',
    '{"version":1,"values":{"name":"Old","typeId":null,"stageId":null,"terms":null,"assignees":{"system_admin":null,"secretary":null,"project_manager":null,"lead_installer":null}}}',
  ]) {
    items.set("gen_air_project_form_draft:alice", raw);
    assert.equal(readProjectDraft("alice"), null);
  }
});

test("blocked storage leaves the form usable", () => {
  globalThis.localStorage = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("quota");
    },
    removeItem() {
      throw new Error("blocked");
    },
  };
  assert.equal(readProjectDraft("alice"), null);
  assert.doesNotThrow(() =>
    saveProjectDraft("alice", { ...toProjectFormValues(null), name: "Draft" }),
  );
  assert.doesNotThrow(() => clearProjectDraft("alice"));
});
