import { test } from "node:test";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import Button from "../src/components/Button/Button";
import { Dialog, DialogActions } from "@mui/material";
import { Children, isValidElement, type ReactElement } from "react";
import GenericPopup from "../src/components/GenericPopup/GenericPopup";
import ApartmentImport from "../src/components/ApartmentImport/ApartmentImport";
import ImportResults from "../src/components/ApartmentImport/components/ImportResults";
import ImportSelection from "../src/components/ApartmentImport/components/ImportSelection";
import ServerErrorBanner from "../src/components/ApartmentImport/components/ServerErrorBanner";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

const renderComponent = async (element: ReactElement) => {
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  await act(async () => {
    state.renderer = create(element);
  });
  assert.ok(state.renderer);
  return state.renderer;
};

const getPrimaryAction = (renderer: ReturnType<typeof create>) => {
  const dialog = renderer.root.findByType(Dialog);
  const actions = Children.toArray(dialog.props.children).find(
    child => isValidElement(child) && child.type === DialogActions,
  );
  assert.ok(isValidElement<{ children: ReactElement[] }>(actions));
  const button = Children.toArray(actions.props.children).find(
    child => isValidElement(child) && child.type === Button,
  );
  assert.ok(isValidElement<{ onClick: () => Promise<void> }>(button));
  return button.props.onClick;
};

const getImportContent = (renderer: ReturnType<typeof create>) => {
  const popup = renderer.root.findByType(GenericPopup);
  return Children.toArray(popup.props.content.props.children);
};

const completeAction = async (): Promise<void> => {};
const ignoreAction = (): void => {};
const emptyCounts = { created: 0, existing: 0, duplicate: 0, error: 0 };
const baseProps = {
  open: false,
  buildingName: "בניין א",
  existingCount: 0,
  onClose: ignoreAction,
  onRetry: ignoreAction,
  onFinish: completeAction,
  onDownloadReport: completeAction,
  onDownloadTemplate: completeAction,
  onFilesSelected: completeAction,
};

test("GenericPopup retains default closing and permits explicit action close ownership", async () => {
  const state = { closed: 0, invoked: 0 };
  const action = async (): Promise<void> => {
    state.invoked += 1;
  };
  const props = {
    open: false,
    title: "חלון",
    onClose: () => {
      state.closed += 1;
    },
    buttons: { primary: { text: "סיום", onClick: action } },
  };
  const renderer = await renderComponent(<GenericPopup {...props} />);
  await act(async () => {
    await getPrimaryAction(renderer)();
  });
  assert.equal(state.closed, 1);
  await act(async () => {
    renderer.update(<GenericPopup closeAfterAction={false} {...props} />);
  });
  await act(async () => {
    await getPrimaryAction(renderer)();
  });
  assert.equal(state.closed, 1);
  assert.equal(state.invoked, 2);
  await act(async () => renderer.unmount());
});

test("selection validates before upload and reports a rejected upload without closing", async () => {
  const state = { uploaded: 0, closed: 0 };
  const onFilesSelected = async (): Promise<void> => {
    state.uploaded += 1;
    throw new Error("upload failed");
  };
  const props = {
    ...baseProps,
    onFilesSelected,
    onClose: () => {
      state.closed += 1;
    },
    view: { stage: "select" as const, fileName: "", progress: null, failure: null, result: null },
  };
  const renderer = await renderComponent(<ApartmentImport {...props} />);
  const select = getImportContent(renderer).find(
    child => isValidElement(child) && child.type === ImportSelection,
  );
  assert.ok(isValidElement<{ onFilesSelected: (files: File[]) => Promise<void> }>(select));
  await act(async () => {
    await select.props.onFilesSelected([new File(["x"], "bad.pdf")]);
  });
  assert.equal(state.uploaded, 0);
  await act(async () => {
    await select.props.onFilesSelected([new File(["x"], "good.xlsx")]);
  });
  assert.equal(state.uploaded, 1);
  assert.equal(state.closed, 0);
  assert.ok(
    getImportContent(renderer).some(
      child => isValidElement(child) && child.type === ServerErrorBanner,
    ),
  );
  await act(async () => renderer.unmount());
});

test("failed finish leaves results open, and retry clears its local error", async () => {
  const state = { closed: 0, retried: 0 };
  const props = {
    ...baseProps,
    onClose: () => {
      state.closed += 1;
    },
    onRetry: () => {
      state.retried += 1;
    },
    onFinish: async () => {
      throw new Error("refresh failed");
    },
    view: {
      stage: "results" as const,
      fileName: "input.xlsx",
      progress: null,
      failure: null,
      result: { counts: emptyCounts, rows: [] },
    },
  };
  const renderer = await renderComponent(<ApartmentImport {...props} />);
  await act(async () => {
    await getPrimaryAction(renderer)();
  });
  assert.equal(state.closed, 0);
  assert.ok(
    getImportContent(renderer).some(
      child => isValidElement(child) && child.type === ServerErrorBanner,
    ),
  );
  const result = getImportContent(renderer).find(
    child => isValidElement(child) && child.type === ImportResults,
  );
  assert.ok(isValidElement<{ onRetry: () => void }>(result));
  await act(async () => {
    result.props.onRetry();
  });
  assert.equal(state.retried, 1);
  assert.equal(
    getImportContent(renderer).some(
      child => isValidElement(child) && child.type === ServerErrorBanner,
    ),
    false,
  );
  await act(async () => renderer.unmount());
});

test("successful finish refreshes then closes once; processing cannot close", async () => {
  const events: string[] = [];
  const props = {
    ...baseProps,
    onClose: () => {
      events.push("close");
    },
    onFinish: async () => {
      events.push("refresh");
    },
    view: {
      stage: "results" as const,
      fileName: "input.xlsx",
      progress: null,
      failure: null,
      result: { counts: emptyCounts, rows: [] },
    },
  };
  const renderer = await renderComponent(<ApartmentImport {...props} />);
  await act(async () => {
    await getPrimaryAction(renderer)();
  });
  assert.deepEqual(events, ["refresh", "close"]);
  const processingView = {
    stage: "processing" as const,
    fileName: "input.xlsx",
    progress: 50,
    failure: null,
    result: null,
  };
  await act(async () => {
    renderer.update(<ApartmentImport {...props} view={processingView} />);
  });
  await act(async () => {
    renderer.root.findByType(GenericPopup).props.onClose();
  });
  assert.deepEqual(events, ["refresh", "close"]);
  await act(async () => renderer.unmount());
});

test("closing an uncertain upload failure refreshes before dismissing", async () => {
  const events: string[] = [];
  const props = {
    ...baseProps,
    onClose: () => {
      events.push("close");
    },
    onFinish: async () => {
      events.push("refresh");
    },
    view: {
      stage: "select" as const,
      fileName: "input.xlsx",
      progress: null,
      failure: { title: "network", message: "uncertain", code: null },
      result: null,
      refreshRequired: true,
    },
  };
  const renderer = await renderComponent(<ApartmentImport {...props} />);
  await act(async () => {
    await getPrimaryAction(renderer)();
  });
  assert.deepEqual(events, ["refresh", "close"]);
  await act(async () => renderer.unmount());
});
