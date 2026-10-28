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
        if (existsSync(url)) {
          return { url: url.href, shortCircuit: true };
        }
      }
    }

    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".ts")) {
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
        }).outputText,
      };
    }

    return next(url, context);
  },
});

const { toAuthorizedProjectUpdate } =
  await import("../src/utilities/project-permission.utility.ts");
const payload = Object.freeze({
  name: "Renamed project",
  stageId: "next-stage",
  typeId: "project-type",
  customerId: "customer-1",
  contactName: "Updated contact",
});
const editableFields = {
  name: "Renamed project",
  typeId: "project-type",
  customerId: "customer-1",
  contactName: "Updated contact",
};

test("an absent account cannot submit a status change while other project fields survive", () => {
  const result = toAuthorizedProjectUpdate(payload, null);

  assert.deepEqual(result, editableFields);
  assert.notEqual(result, payload);
  assert.equal(payload.stageId, "next-stage");
});

test("project editing does not imply permission to change status or mutate the draft", () => {
  const user = { role: "system_admin", permissions: ["projects.update"] };
  const result = toAuthorizedProjectUpdate(payload, user);

  assert.deepEqual(result, editableFields);
  assert.notEqual(result, payload);
  assert.equal(payload.stageId, "next-stage");
});

test("an explicit status grant preserves the selected stage regardless of the account role", () => {
  const user = { role: "secretary", permissions: ["projects.status.change"] };

  assert.deepEqual(toAuthorizedProjectUpdate(payload, user), {
    ...editableFields,
    stageId: "next-stage",
  });
  assert.equal(payload.stageId, "next-stage");
});
