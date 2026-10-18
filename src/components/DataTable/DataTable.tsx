import Card from "../Card/Card";
import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { useStyles } from "./DataTable.style";
import type { IDataTableColumn } from "../../interfaces/data-table.interface";

interface IDataTableProps<TRow> {
  rows: TRow[];
  minWidth?: number;
  footer?: ReactNode;
  toolbar?: ReactNode;
  getRowId: (row: TRow) => string;
  onRowClick?: (row: TRow) => void;
  columns: IDataTableColumn<TRow>[];
  isRowDimmed?: (row: TRow) => boolean;
}

const getGridTemplate = <TRow,>(columns: IDataTableColumn<TRow>[]) =>
  columns.map(column => column.track).join(" ");

const DataTable = <TRow,>({
  rows,
  footer,
  toolbar,
  columns,
  getRowId,
  onRowClick,
  minWidth = 700,
  isRowDimmed = () => false,
}: IDataTableProps<TRow>) => {
  const styles = useStyles();
  const gridTemplate = getGridTemplate(columns);

  return (
    <Card gap="16px">
      {toolbar}
      <Box sx={styles.scroller}>
        <Box role="row" sx={styles.header({ minWidth, gridTemplate })}>
          {columns.map(column => (
            <Box key={column.id} component="span" role="columnheader">
              {column.header}
            </Box>
          ))}
        </Box>
        {rows.map(row => (
          <Box
            role="row"
            key={getRowId(row)}
            onClick={onRowClick && (() => onRowClick(row))}
            sx={styles.row({
              minWidth,
              gridTemplate,
              isDimmed: isRowDimmed(row),
              isClickable: Boolean(onRowClick),
            })}
          >
            {columns.map(column => (
              <Box role="cell" key={column.id}>
                {column.render(row)}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
      {footer}
    </Card>
  );
};

export default DataTable;
