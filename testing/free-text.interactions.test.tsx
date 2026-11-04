import { test, after } from "node:test";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import { setTimeout as settle } from "node:timers/promises";
import { freeTextService } from "../src/services/free-text.service";
import { installDomEventTargets } from "./dom-event-targets.utility";
import FreeTextInput from "../src/components/FreeTextInput/FreeTextInput";
import { FREE_TEXT_DEBOUNCE_MS } from "../src/constants/free-text.constants";
import FreeTextSuggestions from "../src/components/FreeTextInput/components/FreeTextSuggestions";
import { useDebouncedFreeText } from "../src/components/FreeTextInput/hooks/use-debounced-free-text.hook";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
after(installDomEventTargets());

const waitForDebounce = async () => {
  await act(async () => {
    await settle(FREE_TEXT_DEBOUNCE_MS + 30);
  });
};

const deferredSuggestions = () => {
  const state: { resolve: (value: string[]) => void } = { resolve: () => {} };
  const promise = new Promise<string[]>(resolve => {
    state.resolve = resolve;
  });
  return { promise, resolve: (value: string[]) => state.resolve(value) };
};

test("suggestions cancel prior debounce and ignore stale request completion", async () => {
  const originalSuggest = freeTextService.suggest;
  const first = deferredSuggestions();
  const second = deferredSuggestions();
  const requests: Array<{ query: string; signal: AbortSignal | undefined }> = [];
  freeTextService.suggest = async ({ query, signal }) => {
    requests.push({ query, signal });
    return query === "first" ? first.promise : second.promise;
  };

  const snapshots: string[][] = [];
  const Probe = ({ query }: { query: string }) => {
    snapshots.push(useDebouncedFreeText({ query, value: "", endpoint: "/test" }).suggestions);
    return null;
  };
  const renderer = await act(async () => create(<Probe query="cancelled" />));
  try {
    await act(async () => renderer.update(<Probe query="first" />));
    await waitForDebounce();
    assert.deepEqual(
      requests.map(request => request.query),
      ["first"],
    );

    await act(async () => renderer.update(<Probe query="second" />));
    assert.equal(requests[0].signal?.aborted, true);
    await waitForDebounce();
    assert.deepEqual(
      requests.map(request => request.query),
      ["first", "second"],
    );

    await act(async () => first.resolve(["stale result"]));
    assert.deepEqual(snapshots.at(-1), []);
    await act(async () => second.resolve(["current result"]));
    assert.deepEqual(snapshots.at(-1), ["current result"]);

    await act(async () => renderer.update(<Probe query="" />));
    assert.deepEqual(snapshots.at(-1), []);
  } finally {
    await act(async () => renderer.unmount());
    freeTextService.suggest = originalSuggest;
  }
});

test("the selected suggestion resets when a new suggestion list arrives", async () => {
  const originalSuggest = freeTextService.suggest;
  freeTextService.suggest = async ({ query }) => [`${query} one`, `${query} two`];
  const renderer = await act(async () =>
    create(<FreeTextInput value="" validationEndpoint="/test" />, {
      createNodeMock: element =>
        element.type === "input" ? { focus: () => {}, blur: () => {} } : null,
    }),
  );
  try {
    const input = () => renderer.root.findByType("input");
    await act(async () => {
      input().props.onFocus();
      input().props.onChange({ target: { value: "first" } });
    });
    await waitForDebounce();
    const suggestions = () => renderer.root.findByType(FreeTextSuggestions);
    assert.deepEqual(suggestions().props.suggestions, ["first one", "first two"]);
    assert.equal(suggestions().props.activeIndex, 0);

    await act(async () => input().props.onKeyDown({ key: "ArrowDown", preventDefault: () => {} }));
    assert.equal(suggestions().props.activeIndex, 1);

    await act(async () => input().props.onChange({ target: { value: "second" } }));
    await waitForDebounce();
    assert.deepEqual(suggestions().props.suggestions, ["second one", "second two"]);
    assert.equal(suggestions().props.activeIndex, 0);
  } finally {
    await act(async () => renderer.unmount());
    freeTextService.suggest = originalSuggest;
  }
});
