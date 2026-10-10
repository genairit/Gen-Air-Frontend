import type { ReactNode } from "react";

export interface IDataTableColumn<TRow> {
  id: string;
  track: string;
  header: string;
  render: (row: TRow) => ReactNode;
}
