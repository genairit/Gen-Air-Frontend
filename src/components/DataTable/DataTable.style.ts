import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const DIMMED_ROW_OPACITY = 0.55;

interface IGridStyleOptions {
  minWidth: number;
  gridTemplate: string;
}

const createGridRow = ({ minWidth, gridTemplate }: IGridStyleOptions) => ({
  minWidth,
  gap: "16px",
  display: "grid",
  gridTemplateColumns: gridTemplate,
});

export const useStyles = () =>
  createStyles({
    scroller: {
      gap: "12px",
      padding: "8px",
      display: "flex",
      overflowX: "auto",
      flexDirection: "column",
    },
    header: (options: IGridStyleOptions) => ({
      ...createGridRow(options),
      fontSize: 12,
      fontWeight: 600,
      padding: "0 20px",
      color: theme.palette.textMuted,
    }),
    row: ({ isDimmed, ...options }: IGridStyleOptions & { isDimmed: boolean }) => ({
      ...createGridRow(options),
      minHeight: 72,
      padding: "10px 20px",
      alignItems: "center",
      borderRadius: theme.radius.panel,
      boxShadow: theme.softShadow.raisedCompact,
      backgroundColor: theme.palette.iceWhite,
      opacity: isDimmed ? DIMMED_ROW_OPACITY : 1,
    }),
  });
