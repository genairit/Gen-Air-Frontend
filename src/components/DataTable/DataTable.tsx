import Card from "../Card/Card";
import { Box } from "@mui/material";
import type { ReactNode, Ref } from "react";
import { useStyles } from "./DataTable.style";
import ChoiceRow from "../ChoiceRow/ChoiceRow";
import type { IDataTableColumn } from "../../interfaces/data-table.interface";

interface IDataTableProps<TRow> {
  rows: TRow[];
  padding?: string;
  minWidth?: number;
  ariaLabel?: string;
  footer?: ReactNode;
  toolbar?: ReactNode;
  actionTrack?: string;
  scrollMaxHeight?: string;
  endAdornment?: ReactNode;
  getRowId: (row: TRow) => string;
  onRowClick?: (row: TRow) => void;
  scrollerRef?: Ref<HTMLDivElement>;
  columns: IDataTableColumn<TRow>[];
  getRowLabel?: (row: TRow) => string;
  isRowDimmed?: (row: TRow) => boolean;
  renderRowAction?: (row: TRow) => ReactNode;
}

const getGridTemplate = <TRow,>(columns: IDataTableColumn<TRow>[]) =>
  columns.map(column => column.track).join(" ");

const DataTable = <TRow,>({
  rows,
  ariaLabel,
  getRowLabel,
  footer,
  toolbar,
  columns,
  getRowId,
  onRowClick,
  minWidth = 700,
  padding = "24px",
  scrollerRef,
  endAdornment,
  scrollMaxHeight,
  actionTrack = "48px",
  renderRowAction,
  isRowDimmed = () => false,
}: IDataTableProps<TRow>) => {
  const styles = useStyles();
  const gridTemplate = renderRowAction
    ? `${getGridTemplate(columns)} ${actionTrack}`
    : getGridTemplate(columns);
  const headerStyles = styles.header({ minWidth, gridTemplate, isSticky: scrollMaxHeight != null });
  const scrollerStyles = styles.scroller({ maxHeight: scrollMaxHeight });

  return (
    <Card gap="16px" padding={padding} ariaLabel={ariaLabel}>
      {toolbar && <Box sx={styles.toolbar}>{toolbar}</Box>}
      <Box ref={scrollerRef} sx={scrollerStyles}>
        <Box role="row" sx={headerStyles}>
          {columns.map(column => (
            <Box key={column.id} component="span" role="columnheader">
              {column.header}
            </Box>
          ))}
          {renderRowAction && <Box aria-hidden component="span" />}
        </Box>
        {rows.map((row): React.JSX.Element => {
          const id = getRowId(row);
          const actionCell = renderRowAction && <Box aria-hidden component="span" />;
          const withAction = (element: React.JSX.Element): React.JSX.Element =>
            renderRowAction ? (
              <Box key={id} sx={styles.actionWrapper({ minWidth })}>
                {element}
                <Box sx={styles.rowAction}>{renderRowAction(row)}</Box>
              </Box>
            ) : (
              element
            );
          const rowSx = styles.row({
            minWidth,
            gridTemplate,
            isDimmed: isRowDimmed(row),
            isClickable: Boolean(onRowClick),
          });
          if (getRowLabel && onRowClick) {
            return withAction(
              <ChoiceRow
                key={id}
                sx={rowSx}
                data-row-id={id}
                aria-label={getRowLabel(row)}
                onClick={(): void => onRowClick(row)}
              >
                {columns.map(column => (
                  <Box key={column.id} component="span">
                    {column.render(row)}
                  </Box>
                ))}
                {actionCell}
              </ChoiceRow>,
            );
          }

          return withAction(
            <Box key={id} role="row" sx={rowSx} onClick={onRowClick && (() => onRowClick(row))}>
              {columns.map(column => (
                <Box role="cell" key={column.id}>
                  {column.render(row)}
                </Box>
              ))}
              {actionCell}
            </Box>,
          );
        })}
        {endAdornment}
      </Box>
      {footer}
    </Card>
  );
};

export default DataTable;
