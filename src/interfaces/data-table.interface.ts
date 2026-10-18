import type { ReactNode } from "react";

export interface IDataTableColumn<TRow> {
  id: string;
  track: string;
  header: ReactNode;
  render: (row: TRow) => ReactNode;
}
