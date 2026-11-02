import {
  QUOTATION_QUERY_KEY,
  QUOTATION_COUNTS_KEY,
  QUOTATION_DETAIL_KEY,
  QUOTATION_AUTOSAVE_MS,
} from "../src/constants/quotation.constant";

import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import { setTimeout as settle } from "node:timers/promises";
import { catalogueLine } from "../src/utilities/quotation.utility";
import { quotationService } from "../src/services/quotation.service";
import { useQuotationEditor } from "../src/hooks/quotation-editor.hook";
import { catalogueFixture, quotationFixture } from "./quotation.fixture";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQuotationRebrand } from "../src/hooks/quotation-rebrand.hook";
import type { IQuotation, ICatalogueItem } from "../src/interfaces/quotation.interface";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
const state = (): {
  editor: ReturnType<typeof useQuotationEditor> | null;
  renderer: ReturnType<typeof create> | null;
  client: QueryClient;
} => ({
  editor: null,
  renderer: null,
  client: new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 60000, staleTime: 60000 } },
  }),
});
const current = (value: ReturnType<typeof state>) => {
  if (!value.editor) {
    throw new Error("Hook unavailable");
  }
  return value.editor;
};
const mount = async (value: ReturnType<typeof state>, editable = true, canDelete?: boolean) => {
  const Harness = () => {
    value.editor = useQuotationEditor(quotationFixture(), editable, canDelete);
    return null;
  };
  await act(async () => {
    value.renderer = create(
      <QueryClientProvider client={value.client}>
        <Harness />
      </QueryClientProvider>,
    );
  });
};
const unmount = async (value: ReturnType<typeof state>) => {
  await act(async () => {
    value.renderer?.unmount();
    value.client.clear();
  });
};
test("autosave debounces edits, uses returned server version and never sends forged totals", async () => {
  const value = state();
  const calls: string[] = [];
  const save = mock.method(quotationService, "save", async quotation => {
    calls.push(quotation.internalNotes);
    return { ...quotation, version: quotation.version + 1 };
  });
  try {
    await mount(value);
    await act(async () => {
      current(value).update({ ...current(value).quotation, internalNotes: "first" });
    });
    await act(async () => {
      current(value).update({ ...current(value).quotation, internalNotes: "second" });
    });
    await act(async () => {
      await settle(QUOTATION_AUTOSAVE_MS + 30);
    });
    assert.deepEqual(calls, ["second"]);
    assert.equal(current(value).dirty, false);
    assert.equal(current(value).quotation.version, 2);
    await act(async () => {
      current(value).update({ ...current(value).quotation, internalNotes: "third" });
    });
    await act(async () => {
      await settle(QUOTATION_AUTOSAVE_MS + 30);
    });
    assert.equal(current(value).quotation.version, 3);
  } finally {
    save.mock.restore();
    await unmount(value);
  }
});
test("failed autosave preserves the user's edits and blocks review, explicit retry saves", async () => {
  const value = state();
  const save = mock.method(quotationService, "save", async () => {
    throw new Error("network failure");
  });
  const transition = mock.method(quotationService, "transition", async quotation => quotation);
  try {
    await mount(value);
    await act(async () => {
      current(value).update({ ...current(value).quotation, internalNotes: "keep me" });
    });
    await act(async () => {
      await settle(QUOTATION_AUTOSAVE_MS + 30);
    });
    assert.equal(current(value).dirty, true);
    assert.ok(current(value).error);
    assert.equal(current(value).quotation.internalNotes, "keep me");
    await act(async () => {
      await current(value).transition("review");
    });
    assert.equal(transition.mock.callCount(), 0);
    save.mock.mockImplementation(async quotation => ({ ...quotation, version: 2 }));
    await act(async () => {
      current(value).retry();
    });
    await act(async () => {
      await settle(QUOTATION_AUTOSAVE_MS + 30);
    });
    assert.equal(current(value).dirty, false);
    assert.equal(current(value).error, null);
  } finally {
    save.mock.restore();
    transition.mock.restore();
    await unmount(value);
  }
});
test("read-only users cannot alter drafts or trigger autosave", async () => {
  const value = state();
  const save = mock.method(quotationService, "save", async quotation => quotation);
  try {
    await mount(value, false);
    await act(async () => {
      current(value).update({ ...current(value).quotation, internalNotes: "forbidden" });
      await settle(30);
    });
    assert.equal(current(value).quotation.internalNotes, "");
    assert.equal(current(value).dirty, false);
    assert.equal(save.mock.callCount(), 0);
  } finally {
    save.mock.restore();
    await unmount(value);
  }
});

test("review, acknowledgement and reload refresh detail and invalidate a fresh cached list", async () => {
  const value = state();
  const base = quotationFixture();
  const review = { ...base, status: "review", version: 2 };
  const transition = mock.method(quotationService, "transition", async () => review);
  const acknowledge = mock.method(quotationService, "acknowledge", async () => ({
    ...review,
    version: 3,
  }));
  const get = mock.method(quotationService, "get", async () => ({
    ...base,
    version: 4,
    internalNotes: "server",
  }));
  try {
    await mount(value);
    for (const command of [
      () => current(value).transition("review"),
      () => current(value).acknowledge(["warning"]),
      () => current(value).reload(),
    ]) {
      value.client.setQueryData(QUOTATION_QUERY_KEY, [base]);
      assert.equal(value.client.getQueryState(QUOTATION_QUERY_KEY)?.isInvalidated, false);
      await act(command);
      assert.equal(value.client.getQueryState(QUOTATION_QUERY_KEY)?.isInvalidated, true);
      assert.deepEqual(
        value.client.getQueryData(QUOTATION_DETAIL_KEY(base.id)),
        current(value).quotation,
      );
      assert.equal(current(value).error, null);
    }
    assert.equal(current(value).quotation.version, 4);
    assert.equal(current(value).quotation.internalNotes, "server");
    assert.equal(transition.mock.callCount(), 1);
    assert.equal(acknowledge.mock.callCount(), 1);
  } finally {
    transition.mock.restore();
    acknowledge.mock.restore();
    get.mock.restore();
    await unmount(value);
  }
});
test("failed transitions, acknowledgements and reload preserve the quotation and permit retry", async () => {
  const value = state();
  const transition = mock.method(quotationService, "transition", async () => {
    throw new Error("version conflict");
  });
  const acknowledge = mock.method(quotationService, "acknowledge", async () => {
    throw new Error("approval denied");
  });
  const get = mock.method(quotationService, "get", async () => {
    throw new Error("offline");
  });
  try {
    await mount(value);
    for (const command of [
      () => current(value).transition("review"),
      () => current(value).acknowledge(["warning"]),
      () => current(value).reload(),
    ]) {
      await act(command);
      assert.deepEqual(current(value).quotation, quotationFixture());
      assert.ok(current(value).error);
      assert.equal(current(value).busy, false);
    }
    transition.mock.mockImplementation(async () => ({
      ...quotationFixture(),
      status: "review",
      version: 2,
    }));
    await act(() => current(value).transition("review"));
    assert.equal(current(value).error, null);
    assert.equal(current(value).quotation.version, 2);
  } finally {
    transition.mock.restore();
    acknowledge.mock.restore();
    get.mock.restore();
    await unmount(value);
  }
});

test("brand replacement serializes confirmations and ignores cancellation until resolution", async () => {
  const result = { hook: null as ReturnType<typeof useQuotationRebrand> | null };
  const source = quotationFixture();
  source.sections = [
    {
      id: "section",
      title: "",
      systemType: "VRF",
      items: [catalogueLine(catalogueFixture(), null)],
    },
  ];
  const gate = Promise.withResolvers<ICatalogueItem>();
  const read = mock.method(quotationService, "catalogueItem", () => gate.promise);
  const search = mock.method(quotationService, "catalogue", async () => [
    { ...catalogueFixture(), id: "target", brand: "תדיראן" },
  ]);
  const updates: IQuotation[] = [];
  const hook = () => {
    if (!result.hook) {
      throw new Error("Hook unavailable");
    }
    return result.hook;
  };
  const Harness = () => {
    result.hook = useQuotationRebrand({
      quotation: source,
      blocked: false,
      onChange: next => updates.push(next),
    });
    return null;
  };
  const renderer = { value: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      renderer.value = create(<Harness />);
    });
    await act(async () => {
      hook().request("תדיראן");
    });
    const pending = { value: null as Promise<void> | null };
    await act(async () => {
      pending.value = hook().confirm();
    });
    assert.equal(hook().busy, true);
    await act(async () => {
      await hook().confirm();
      hook().cancel();
      hook().request("אחר");
    });
    assert.equal(read.mock.callCount(), 1);
    assert.equal(hook().pendingBrand, "תדיראן");
    assert.equal(updates.length, 0);
    await act(async () => {
      gate.resolve(catalogueFixture());
      await pending.value;
    });
    assert.equal(updates.length, 1);
    assert.equal(updates[0].brand, "תדיראן");
    assert.equal(hook().busy, false);
    assert.equal(hook().pendingBrand, null);
    assert.equal(source.brand, "אלקטרה");
  } finally {
    read.mock.restore();
    search.mock.restore();
    await act(async () => {
      renderer.value?.unmount();
    });
  }
});

test("failed brand replacement preserves edits and keeps confirmation available for retry", async () => {
  const source = quotationFixture();
  source.sections = [
    {
      id: "section",
      title: "",
      systemType: "VRF",
      items: [catalogueLine(catalogueFixture(), null)],
    },
  ];
  const read = mock.method(quotationService, "catalogueItem", async () => {
    throw new Error("offline");
  });
  const result = { hook: null as ReturnType<typeof useQuotationRebrand> | null };
  const updates: IQuotation[] = [];
  const hook = () => {
    if (!result.hook) {
      throw new Error("Hook unavailable");
    }
    return result.hook;
  };
  const Harness = () => {
    result.hook = useQuotationRebrand({
      quotation: source,
      blocked: false,
      onChange: next => updates.push(next),
    });
    return null;
  };
  const renderer = { value: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      renderer.value = create(<Harness />);
    });
    await act(async () => {
      hook().request("תדיראן");
    });
    await act(() => hook().confirm());
    assert.equal(updates.length, 0);
    assert.equal(hook().error, "offline");
    assert.equal(hook().busy, false);
    assert.equal(hook().pendingBrand, "תדיראן");
    await act(async () => {
      hook().cancel();
    });
    assert.equal(hook().pendingBrand, null);
  } finally {
    read.mock.restore();
    await act(async () => {
      renderer.value?.unmount();
    });
  }
});

test("delete denies missing permission and dirty edits, independently of update permission", async () => {
  const remove = mock.method(quotationService, "delete", async () => {});
  const denied = state();
  const dirty = state();
  const readonly = state();
  try {
    await mount(denied);
    await act(() => current(denied).remove());
    assert.equal(remove.mock.callCount(), 0);
    await mount(dirty, true, true);
    await act(async () =>
      current(dirty).update({ ...current(dirty).quotation, internalNotes: "unsaved" }),
    );
    await act(() => current(dirty).remove());
    assert.equal(remove.mock.callCount(), 0);
    assert.equal(current(dirty).quotation.internalNotes, "unsaved");
    await mount(readonly, false, true);
    await act(() => current(readonly).remove());
    assert.equal(remove.mock.callCount(), 1);
    assert.equal(current(readonly).deleted, true);
  } finally {
    remove.mock.restore();
    await unmount(denied);
    await unmount(dirty);
    await unmount(readonly);
  }
});

test("delete serializes duplicate commands, cancels detail and invalidates list and status counts", async () => {
  const value = state();
  const gate = Promise.withResolvers<void>();
  const remove = mock.method(quotationService, "delete", () => gate.promise);
  const cancel = mock.method(value.client, "cancelQueries");
  const transition = mock.method(quotationService, "transition", async quotation => quotation);
  const pending = { value: null as Promise<void> | null };
  try {
    await mount(value, true, true);
    value.client.setQueryData(QUOTATION_QUERY_KEY, [quotationFixture()]);
    value.client.setQueryData(QUOTATION_COUNTS_KEY, { draft: 1 });
    value.client.setQueryData(QUOTATION_DETAIL_KEY(quotationFixture().id), quotationFixture());
    await act(async () => {
      pending.value = current(value).remove();
      await current(value).remove();
      await current(value).transition("review");
    });
    assert.equal(remove.mock.callCount(), 1);
    assert.equal(transition.mock.callCount(), 0);
    assert.equal(current(value).busy, true);
    assert.equal(current(value).deleted, false);
    await act(async () => {
      gate.resolve();
      await pending.value;
    });
    assert.equal(current(value).deleted, true);
    assert.equal(current(value).busy, false);
    assert.deepEqual(cancel.mock.calls[0].arguments[0], {
      queryKey: QUOTATION_DETAIL_KEY(quotationFixture().id),
      exact: true,
    });
    assert.equal(value.client.getQueryState(QUOTATION_QUERY_KEY)?.isInvalidated, true);
    assert.equal(value.client.getQueryState(QUOTATION_COUNTS_KEY)?.isInvalidated, true);
    await act(async () => {
      await current(value).remove();
      current(value).update({ ...current(value).quotation, internalNotes: "after deletion" });
    });
    assert.equal(remove.mock.callCount(), 1);
    assert.equal(current(value).dirty, false);
  } finally {
    remove.mock.restore();
    cancel.mock.restore();
    transition.mock.restore();
    await unmount(value);
  }
});

test("delete failure preserves quotation and cache, isolates error and permits retry", async () => {
  const value = state();
  const remove = mock.method(quotationService, "delete", async () => {
    throw new Error("version conflict");
  });
  try {
    await mount(value, true, true);
    const base = current(value).quotation;
    value.client.setQueryData(QUOTATION_DETAIL_KEY(base.id), base);
    value.client.setQueryData(QUOTATION_QUERY_KEY, [base]);
    await act(() => current(value).remove());
    assert.equal(current(value).deleted, false);
    assert.equal(current(value).busy, false);
    assert.equal(current(value).error, null);
    assert.ok(current(value).deleteError);
    assert.deepEqual(current(value).quotation, base);
    assert.deepEqual(value.client.getQueryData(QUOTATION_DETAIL_KEY(base.id)), base);
    assert.equal(value.client.getQueryState(QUOTATION_QUERY_KEY)?.isInvalidated, false);
    remove.mock.mockImplementation(async () => {});
    await act(() => current(value).remove());
    assert.equal(remove.mock.callCount(), 2);
    assert.equal(current(value).deleteError, null);
    assert.equal(current(value).deleted, true);
  } finally {
    remove.mock.restore();
    await unmount(value);
  }
});

test("delete uses latest autosave and conflict reload versions", async () => {
  const value = state();
  const save = mock.method(quotationService, "save", async quotation => ({
    ...quotation,
    version: 7,
  }));
  const get = mock.method(quotationService, "get", async () => ({
    ...quotationFixture(),
    version: 9,
  }));
  const remove = mock.method(quotationService, "delete", async () => {
    throw new Error("conflict");
  });
  try {
    await mount(value, true, true);
    await act(async () =>
      current(value).update({ ...current(value).quotation, internalNotes: "save first" }),
    );
    await act(async () => {
      await settle(QUOTATION_AUTOSAVE_MS + 30);
    });
    await act(() => current(value).remove());
    assert.deepEqual(remove.mock.calls[0].arguments[0], { id: quotationFixture().id, version: 7 });
    await act(() => current(value).reload());
    assert.equal(current(value).deleteError, null);
    assert.equal(current(value).quotation.version, 9);
    remove.mock.mockImplementation(async () => {});
    await act(() => current(value).remove());
    assert.deepEqual(remove.mock.calls[1].arguments[0], { id: quotationFixture().id, version: 9 });
  } finally {
    save.mock.restore();
    get.mock.restore();
    remove.mock.restore();
    await unmount(value);
  }
});
