import { test, after } from "node:test";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import DataTable from "../src/components/DataTable/DataTable";
import { installDomEventTargets } from "./dom-event-targets.utility";
import type { IDataTableColumn } from "../src/interfaces/data-table.interface";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
after(installDomEventTargets());

interface IRow {
  id: string;
  name: string;
}

const ROWS: IRow[] = [
  { id: "a", name: "first" },
  { id: "b", name: "second" },
];
const COLUMNS: IDataTableColumn<IRow>[] = [
  { id: "name", header: "name", track: "1fr", render: row => row.name },
];

const render = (clicks: string[], removals: string[]) => {
  let renderer: ReturnType<typeof create> | null = null;
  act(() => {
    renderer = create(
      <DataTable
        rows={ROWS}
        columns={COLUMNS}
        getRowId={row => row.id}
        getRowLabel={row => `open ${row.name}`}
        onRowClick={row => clicks.push(row.id)}
        renderRowAction={row => (
          <button data-trash={row.id} onClick={() => removals.push(row.id)}>
            remove
          </button>
        )}
      />,
    );
  });
  if (!renderer) throw new Error("Renderer was not created");
  return renderer as ReturnType<typeof create>;
};

test("row actions render once per row beside, not inside, a clickable row", () => {
  const renderer = render([], []);
  const trash = renderer.root.findAll(node => node.type === "button" && "data-trash" in node.props);
  assert.deepEqual(
    trash.map(node => node.props["data-trash"]),
    ["a", "b"],
  );
  const clickableRows = renderer.root.findAll(node => "data-row-id" in node.props);
  assert.ok(clickableRows.length >= 2);
  for (const row of clickableRows) {
    assert.equal(
      row.findAll(node => node.type === "button" && "data-trash" in node.props).length,
      0,
      "the action button must not be nested in the row button",
    );
  }
});

test("the row action has its own click target and does not open the row", () => {
  const clicks: string[] = [];
  const removals: string[] = [];
  const renderer = render(clicks, removals);
  const [first] = renderer.root.findAll(
    node => node.type === "button" && "data-trash" in node.props,
  );
  act(() => first.props.onClick());
  assert.deepEqual(removals, ["a"]);
  assert.deepEqual(clicks, []);
});
