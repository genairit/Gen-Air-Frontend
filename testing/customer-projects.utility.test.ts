import {
  STAGE_ID,
  CUSTOMER_ID,
  OTHER_STAGE_ID,
  createRelatedPage,
  OTHER_CUSTOMER_ID,
  createRelatedProject,
} from "./customer-projects.fixture";

import {
  getCustomerProjectPath,
  getCustomerProjectType,
  flattenCustomerProjects,
  getCustomerProjectContext,
} from "../src/utilities/customer-project.utility";

import {
  isCustomerProjectKind,
  isCustomerProjectItem,
  isCustomerProjectPage,
} from "../src/utilities/guards/customer-project.guard";

import { test } from "node:test";
import { createElement } from "react";
import assert from "node:assert/strict";
import Tabs from "../src/components/Tabs/Tabs";
import { renderToStaticMarkup } from "react-dom/server";
import { TABS_VARIANTS } from "../src/constants/tabs.constant";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { CUSTOMER_PROJECT_KINDS } from "../src/constants/customer-project.constant";

test("curated project guards accept all kinds and minimal member identities without full employee records", () => {
  for (const kind of Object.values(CUSTOMER_PROJECT_KINDS)) {
    const project = createRelatedProject({ kind });
    assert.equal(isCustomerProjectItem(project), true);
    assert.equal(isCustomerProjectPage(createRelatedPage({ items: [project] })), true);
  }
  assert.equal(
    isCustomerProjectItem(
      createRelatedProject({ members: [{ user: null }], projectType: null, stage: null }),
    ),
    true,
  );
});

test("guards reject unknown kinds, incomplete metadata and malformed collection/count values", () => {
  for (const value of [
    null,
    {},
    "project",
    { ...createRelatedProject(), kind: "unknown" },
    { ...createRelatedProject(), members: [{}] },
    { ...createRelatedProject(), building: { id: "a" } },
    { ...createRelatedProject(), updatedAt: 5 },
    { ...createRelatedProject(), apartmentCount: -1 },
  ]) {
    assert.equal(isCustomerProjectItem(value), false);
  }
  for (const value of [
    null,
    { ...createRelatedPage(), items: {} },
    { ...createRelatedPage(), nextCursor: 1 },
    { ...createRelatedPage(), total: -1 },
    { ...createRelatedPage(), total: 1.2 },
    { ...createRelatedPage(), counts: { total: 1, byStage: [] } },
  ]) {
    assert.equal(isCustomerProjectPage(value), false);
  }
  assert.equal(isCustomerProjectKind(null), false);
  assert.equal(isCustomerProjectKind("unknown"), false);
});

test("buildings and standalone rows use their existing project route while apartments use their parent route", () => {
  const project = createRelatedProject();
  assert.equal(getCustomerProjectPath(project), `/projects/${project.id}`);
  assert.equal(
    getCustomerProjectPath({ ...project, kind: CUSTOMER_PROJECT_KINDS.BUILDING }),
    `/projects/${project.id}`,
  );
  assert.equal(
    getCustomerProjectPath({
      ...project,
      kind: CUSTOMER_PROJECT_KINDS.APARTMENT,
      parentProjectId: "building-1",
    }),
    `/projects/building-1/apartments/${project.id}`,
  );
});

test("type and context labels distinguish an apartment from its inherited building type and retain floor zero", () => {
  const project = createRelatedProject();
  assert.equal(getCustomerProjectType(project), "פרויקט עצמאי");
  assert.equal(
    getCustomerProjectType({ ...project, kind: CUSTOMER_PROJECT_KINDS.BUILDING }),
    "בניין",
  );
  assert.equal(
    getCustomerProjectType({ ...project, kind: CUSTOMER_PROJECT_KINDS.APARTMENT }),
    "דירה",
  );
  assert.equal(getCustomerProjectContext(project), "");
  const building = { id: "building-1", name: "בניין ".repeat(40), code: "GA-B1" };
  assert.equal(
    getCustomerProjectContext({ ...project, building, customerFloor: 0 }),
    `${building.name} · GA-B1 · קומה 0`,
  );
});

test("page flattening deduplicates by identity while preserving order and refreshed record data", () => {
  const first = createRelatedProject();
  const second = createRelatedProject({ id: "project-2", name: first.name });
  const result = flattenCustomerProjects([
    { items: [first, second] },
    { items: [{ ...first, name: "שם מעודכן" }] },
  ]);
  assert.deepEqual(
    result.map(row => row.id),
    [first.id, second.id],
  );
  assert.equal(result[0].name, "שם מעודכן");
});

test("cache identities separate customers, search and selected status", () => {
  const first = QUERY_KEYS.customerProjects(CUSTOMER_ID, { search: "", stageId: null });
  for (const other of [
    QUERY_KEYS.customerProjects(OTHER_CUSTOMER_ID, { search: "", stageId: null }),
    QUERY_KEYS.customerProjects(CUSTOMER_ID, { search: "חדש", stageId: null }),
    QUERY_KEYS.customerProjects(CUSTOMER_ID, { search: "", stageId: STAGE_ID }),
    QUERY_KEYS.customerProjects(CUSTOMER_ID, { search: "", stageId: OTHER_STAGE_ID }),
  ]) {
    assert.notDeepEqual(first, other);
  }
});

test("shared Tabs preserves parenthesized default counts including zero and supports opt-in bare counts", () => {
  const items = [
    { id: "first", label: "ראשון", count: 0 },
    { id: "second", label: "שני", count: 2 },
    { id: "no-count", label: "ללא ספירה" },
  ];
  const onChange = () => {};
  const original = renderToStaticMarkup(
    createElement(Tabs, { items, onChange, activeId: "first" }),
  );
  assert.ok(original.includes(">(0)<"));
  assert.ok(original.includes(">(2)<"));

  const formatted: number[] = [];
  const formatCount = (value: number) => {
    formatted.push(value);
    return String(value);
  };
  const optedIn = renderToStaticMarkup(
    createElement(Tabs, {
      items,
      onChange,
      formatCount,
      activeId: "first",
      variant: TABS_VARIANTS.PILLS,
    }),
  );
  assert.deepEqual(formatted, [0, 2]);
  assert.ok(optedIn.includes(">0<"));
  assert.ok(optedIn.includes(">2<"));
  assert.ok(!optedIn.includes(">(0)<"));
  assert.ok(!optedIn.includes(">(2)<"));
});
