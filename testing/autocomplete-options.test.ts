import { test } from "node:test";
import assert from "node:assert/strict";
import { createRef, createElement, type ReactNode } from "react";
import { installDomEventTargets } from "./dom-event-targets.utility";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import Autocomplete from "../src/vendor/smartbase/components/Autocomplete/Autocomplete";
import { hasRenderableChildren } from "../src/vendor/smartbase/utilities/react-node.utility";
import type { IAutocompleteActions } from "../src/vendor/smartbase/interfaces/autocomplete.interface";
import { getVisibleSearchOptions } from "../src/vendor/smartbase/components/Autocomplete/utilities/autocomplete.utility";

const EMPTY_TEXT = "לא נמצאו פריטים לבדיקה";

const openEmptyAutocomplete = async (emptyFeedback: ReactNode) => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const restoreDom = installDomEventTargets();
  Reflect.set(window, "requestAnimationFrame", () => 0);
  Reflect.set(window, "cancelAnimationFrame", () => {});
  const actionsRef = createRef<IAutocompleteActions>();
  const state: { renderer: ReactTestRenderer | null } = { renderer: null };
  const render = (feedback: ReactNode) =>
    createElement(Autocomplete, {
      actionsRef,
      value: null,
      options: [],
      onChange: () => {},
      isSearchMode: false,
      emptyText: EMPTY_TEXT,
      emptyFeedback: feedback,
    });
  try {
    await act(async () => {
      state.renderer = create(render(emptyFeedback));
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    const actions = actionsRef.current;
    assert.ok(actions);
    await act(async () => actions.open());
    const update = async (feedback: ReactNode): Promise<void> => {
      await act(async () => renderer.update(render(feedback)));
    };
    const close = async (): Promise<void> => {
      await act(async () => renderer.unmount());
      restoreDom();
    };
    return { renderer, update, close };
  } catch (error) {
    await act(async () => state.renderer?.unmount());
    restoreDom();
    throw error;
  }
};

test("server-filtered autocomplete keeps every returned result, including duplicate labels", () => {
  const results = [
    { value: "first", label: "שם זהה" },
    { value: "second", label: "שם זהה" },
  ];

  assert.deepEqual(getVisibleSearchOptions(results, "unrelated query", false), results);
  assert.deepEqual(getVisibleSearchOptions(results, "שם זהה", true), results);
  assert.deepEqual(getVisibleSearchOptions(results, "unrelated query", true), []);
});

test("numeric zero empty feedback renders outside the listbox and replaces the default empty message", async () => {
  assert.equal(hasRenderableChildren(0), true);
  const harness = await openEmptyAutocomplete(0);
  try {
    const listbox = harness.renderer.root.find(
      node => typeof node.type === "string" && node.props.role === "listbox",
    );
    const zeroFeedback = harness.renderer.root.findAll(
      node => typeof node.type === "string" && node.children.includes("0"),
    );
    assert.equal(zeroFeedback.length, 1);
    assert.equal(
      listbox.findAll(node => typeof node.type === "string" && node.children.includes("0")).length,
      0,
    );
    assert.equal(listbox.findAllByProps({ role: "option" }).length, 0);
    assert.equal(
      harness.renderer.root.findAll(
        node => typeof node.type === "string" && node.children.includes(EMPTY_TEXT),
      ).length,
      0,
    );
  } finally {
    await harness.close();
  }
});

test("non-rendering empty feedback values keep the normal autocomplete empty message", async () => {
  const emptyValues: ReactNode[] = [null, false, "", [], [null, false, "", []]];
  const harness = await openEmptyAutocomplete(null);
  try {
    for (const value of emptyValues) {
      assert.equal(hasRenderableChildren(value), false);
      await harness.update(value);
      const listbox = harness.renderer.root.find(
        node => typeof node.type === "string" && node.props.role === "listbox",
      );
      const emptyMessages = listbox.findAll(
        node => typeof node.type === "string" && node.children.includes(EMPTY_TEXT),
      );
      assert.equal(emptyMessages.length, 1);
      assert.equal(emptyMessages[0].props.role, "option");
      assert.equal(emptyMessages[0].props["aria-disabled"], true);
    }
  } finally {
    await harness.close();
  }
});
