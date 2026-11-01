import {
  toLightingPayload,
  isProjectNameConflict,
  getLightingHeightError,
  validateConstraintField,
  hasValidProjectLighting,
} from "../src/utilities/project-constraints.utility";

import {
  PROJECT_CONSTRAINTS,
  PROJECT_CONSTRAINT_COPY,
} from "../src/constants/project-constraints.constant";

import { test } from "node:test";
import { AxiosError } from "axios";
import assert from "node:assert/strict";
import { project } from "./project-tasks.fixture";
import { isApiProject } from "../src/utilities/guards/api.guard";
import { isRecord } from "../src/utilities/guards/primitive.guard";
import { LOCAL_STORAGE_KEYS } from "../src/constants/storage.constant";
import { makeValues, createMemoryStorage } from "./project-constraints.fixture";
import { toProjectFormValues, toProjectPayload } from "../src/utilities/project.utility";
import { saveProjectDraft, readProjectDraft } from "../src/utilities/project-draft.utility";

const draftUserId = "constraints-user";
const draftKey = `${LOCAL_STORAGE_KEYS.PROJECT_FORM_DRAFT}:${draftUserId}`;
const memory = createMemoryStorage();
Reflect.set(globalThis, "localStorage", memory);

test("new and legacy projects default lighting off with an empty input", () => {
  const empty = toProjectFormValues(null);
  const legacy = toProjectFormValues(project);
  for (const values of [empty, legacy]) {
    assert.equal(values.hasGeneralLightingCeilingLowering, false);
    assert.equal(values.generalLightingCeilingLoweringHeight, "");
  }
});

test("reading an enabled saved zero or decimal restores exact numeric text", () => {
  for (const height of [0, 25.5]) {
    const values = toProjectFormValues({
      ...project,
      hasGeneralLightingCeilingLowering: true,
      generalLightingCeilingLoweringHeight: height,
    });
    assert.equal(values.hasGeneralLightingCeilingLowering, true);
    assert.equal(values.generalLightingCeilingLoweringHeight, String(height));
    assert.deepEqual(toLightingPayload(values), {
      hasGeneralLightingCeilingLowering: true,
      generalLightingCeilingLoweringHeight: height,
    });
  }
});

test("enabled lowering requires a value while disabled ignores a stale height", () => {
  const values = { ...makeValues(), hasGeneralLightingCeilingLowering: true };
  assert.equal(getLightingHeightError(values), PROJECT_CONSTRAINT_COPY.HEIGHT_REQUIRED);
  const disabled = {
    ...values,
    hasGeneralLightingCeilingLowering: false,
    generalLightingCeilingLoweringHeight: "bad",
  };
  assert.equal(getLightingHeightError(disabled), "");
  assert.equal(toLightingPayload(disabled).generalLightingCeilingLoweringHeight, null);
});

test("nonnegative decimal centimeters accept zero and outer spaces without integer rounding", () => {
  for (const height of ["0", "0.125", "25.50", " 25.5 "]) {
    const values = {
      ...makeValues(),
      hasGeneralLightingCeilingLowering: true,
      generalLightingCeilingLoweringHeight: height,
    };
    assert.equal(getLightingHeightError(values), "");
    assert.equal(toLightingPayload(values).generalLightingCeilingLoweringHeight, Number(height));
  }
});

test("letters, negative values, exponent syntax and nonfinite heights are rejected", () => {
  for (const height of ["x", "-1", "1e4", "25cm", "25,5", "NaN", "Infinity", "9".repeat(400)]) {
    assert.equal(
      getLightingHeightError({
        ...makeValues(),
        hasGeneralLightingCeilingLowering: true,
        generalLightingCeilingLoweringHeight: height,
      }),
      PROJECT_CONSTRAINT_COPY.HEIGHT_INVALID,
    );
  }
});

test("field feedback exposes the actual validation result", () => {
  assert.deepEqual(validateConstraintField("duplicate"), {
    isValid: false,
    errorText: "duplicate",
  });
  assert.deepEqual(validateConstraintField(""), { isValid: true, errorText: "" });
});

test("a domain-name conflict is distinguished from unrelated failures", () => {
  const error = new AxiosError("conflict");
  Reflect.set(error, "response", {
    data: { code: PROJECT_CONSTRAINTS.NAME_CONFLICT_CODE },
    status: 409,
  });
  assert.equal(isProjectNameConflict(error), true);
  const other = new AxiosError("other");
  Reflect.set(other, "response", { data: { code: "OTHER" }, status: 409 });
  for (const input of [
    other,
    new Error("network"),
    null,
    { code: PROJECT_CONSTRAINTS.NAME_CONFLICT_CODE },
  ]) {
    assert.equal(isProjectNameConflict(input), false);
  }
});

test("draft roundtrip retains lighting inputs without persisting sensitive intake", () => {
  memory.clear();
  const values = {
    ...makeValues(),
    hasGeneralLightingCeilingLowering: true,
    generalLightingCeilingLoweringHeight: "25.5",
  };
  saveProjectDraft(draftUserId, values);
  const restored = readProjectDraft(draftUserId);
  assert.equal(restored?.hasGeneralLightingCeilingLowering, true);
  assert.equal(restored?.generalLightingCeilingLoweringHeight, "25.5");
  const raw = memory.getItem(draftKey);
  assert.ok(raw);
  assert.equal(raw.includes('"customerId"'), false);
  assert.equal(raw.includes('"contact"'), false);
});

test("old version-two drafts restore without the newly added attributes", () => {
  memory.clear();
  saveProjectDraft(draftUserId, makeValues());
  const raw = memory.getItem(draftKey);
  assert.ok(raw);
  const parsed: unknown = JSON.parse(raw);
  assert.ok(isRecord(parsed) && isRecord(parsed.values));
  Reflect.deleteProperty(parsed.values, "hasGeneralLightingCeilingLowering");
  Reflect.deleteProperty(parsed.values, "generalLightingCeilingLoweringHeight");
  memory.setItem(draftKey, JSON.stringify(parsed));
  const restored = readProjectDraft(draftUserId);
  assert.equal(restored?.name, project.name);
  assert.equal(restored?.hasGeneralLightingCeilingLowering, false);
  assert.equal(restored?.generalLightingCeilingLoweringHeight, "");
});

test("malformed lighting draft types are not trusted", () => {
  for (const changes of [
    { hasGeneralLightingCeilingLowering: "yes" },
    { generalLightingCeilingLoweringHeight: 25 },
  ]) {
    memory.clear();
    saveProjectDraft(draftUserId, makeValues());
    const raw = memory.getItem(draftKey);
    assert.ok(raw);
    const parsed: unknown = JSON.parse(raw);
    assert.ok(isRecord(parsed) && isRecord(parsed.values));
    Object.assign(parsed.values, changes);
    memory.setItem(draftKey, JSON.stringify(parsed));
    assert.equal(readProjectDraft(draftUserId), null);
  }
});

test("submission preserves case and internal spaces while trimming only the outside", () => {
  const values = {
    ...makeValues(),
    name: "  Mixed  CASE  ",
    hasGeneralLightingCeilingLowering: true,
    generalLightingCeilingLoweringHeight: "0",
  };
  const payload = toProjectPayload({ values, fieldSet: null, originalIntake: null });
  assert.equal(payload?.name, "Mixed  CASE");
  assert.equal(payload?.generalLightingCeilingLoweringHeight, 0);
});

test("invalid enabled input cannot be serialized as a misleading zero height", () => {
  for (const height of ["", "   ", "letters", "NaN", "Infinity", "-1"]) {
    const payload = toLightingPayload({
      ...makeValues(),
      hasGeneralLightingCeilingLowering: true,
      generalLightingCeilingLoweringHeight: height,
    });
    assert.equal(payload.hasGeneralLightingCeilingLowering, true);
    assert.equal(payload.generalLightingCeilingLoweringHeight, null);
  }
});

test("project lighting guard accepts legacy omission and valid complete values", () => {
  assert.equal(hasValidProjectLighting({}), true);
  assert.equal(hasValidProjectLighting(project), true);
  for (const height of [0, 25.5]) {
    const enabled = {
      ...project,
      hasGeneralLightingCeilingLowering: true,
      generalLightingCeilingLoweringHeight: height,
    };
    assert.equal(hasValidProjectLighting(enabled), true);
    assert.equal(isApiProject(enabled), true);
  }
  const disabled = {
    ...project,
    hasGeneralLightingCeilingLowering: false,
    generalLightingCeilingLoweringHeight: null,
  };
  assert.equal(hasValidProjectLighting(disabled), true);
  assert.equal(isApiProject(disabled), true);
});

test("project lighting guard rejects partial, inconsistent and nonfinite API values", () => {
  const invalid = [
    null,
    { hasGeneralLightingCeilingLowering: true },
    { generalLightingCeilingLoweringHeight: 25 },
    { hasGeneralLightingCeilingLowering: "yes", generalLightingCeilingLoweringHeight: 25 },
    { hasGeneralLightingCeilingLowering: false, generalLightingCeilingLoweringHeight: 25 },
    { hasGeneralLightingCeilingLowering: true, generalLightingCeilingLoweringHeight: null },
    { hasGeneralLightingCeilingLowering: true, generalLightingCeilingLoweringHeight: "25" },
    { hasGeneralLightingCeilingLowering: true, generalLightingCeilingLoweringHeight: Number.NaN },
    {
      hasGeneralLightingCeilingLowering: true,
      generalLightingCeilingLoweringHeight: Number.POSITIVE_INFINITY,
    },
    { hasGeneralLightingCeilingLowering: true, generalLightingCeilingLoweringHeight: -1 },
  ];
  for (const value of invalid) {
    assert.equal(hasValidProjectLighting(value), false);
    if (value) {
      assert.equal(isApiProject({ ...project, ...value }), false);
    }
  }
});
