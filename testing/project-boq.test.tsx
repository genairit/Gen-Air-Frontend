import { test } from "node:test";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import Button from "../src/components/Button/Button";
import TextField from "../src/components/TextField/TextField";
import BoqLineEditor from "../src/pages/project-boq/BoqLineEditor";
import type { IBoqLine } from "../src/interfaces/project-boq.interface";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
const line: IBoqLine = {
  id: "line-1",
  materialId: "material-1",
  sourceKey: "source-1",
  systemTitle: "Cooling",
  componentTitle: "Unit",
  materialCode: "MAT-1",
  materialName: "Bracket",
  materialCategory: "Mounting",
  materialSpecification: null,
  materialUnit: "unit",
  sourceBasis: "fixed",
  proposedQuantity: "2",
  requiredQuantity: "2",
  quantityOverridden: false,
  estimatedUnitCost: null,
  estimatedLineCost: null,
  reviewState: "confirmed",
  notes: "",
  displayOrder: 0,
  requestedQuantity: null,
  orderedQuantity: null,
  remainingQuantity: null,
};
const save = async () => {};

test("BOQ row hides writes for read-only users", async () => {
  const state = { renderer: null as ReturnType<typeof create> | null };
  await act(async () => {
    state.renderer = create(
      <BoqLineEditor line={line} revision={1} onSave={save} canManage={false} />,
    );
  });
  try {
    assert.equal(state.renderer!.root.findAllByType(Button).length, 0);
    assert.ok(state.renderer!.root.findAllByType(TextField).every(field => field.props.disabled));
  } finally {
    await act(async () => state.renderer?.unmount());
  }
});

test("BOQ row remounts with regenerated server quantities", async () => {
  const state = { renderer: null as ReturnType<typeof create> | null };
  await act(async () => {
    state.renderer = create(
      <BoqLineEditor canManage line={line} revision={1} onSave={save} key={`${line.id}:1`} />,
    );
  });
  try {
    const updated = { ...line, requiredQuantity: "5", estimatedUnitCost: "120" };
    await act(async () => {
      state.renderer!.update(
        <BoqLineEditor canManage revision={2} onSave={save} line={updated} key={`${line.id}:2`} />,
      );
    });
    const fields = state.renderer!.root.findAllByType(TextField);
    assert.equal(fields[0].props.value, "5");
    assert.equal(fields[1].props.value, "120");
  } finally {
    await act(async () => state.renderer?.unmount());
  }
});
