import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const DIMMED_ROW_OPACITY = 0.55;

interface IGridStyleOptions {
  minWidth: number;
  isSticky?: boolean;
  gridTemplate: string;
}

interface IRowStyleOptions extends IGridStyleOptions {
  isDimmed: boolean;
  isClickable: boolean;
}

const createGridRow = ({ minWidth, gridTemplate }: IGridStyleOptions) => ({
  minWidth,
  gap: "16px",
  display: "grid",
  gridTemplateColumns: gridTemplate,
});

export const useStyles = () =>
  createStyles({
    scroller: ({ maxHeight = "none" }: { maxHeight?: string }) => ({
      maxHeight,
      gap: "12px",
      padding: "8px",
      display: "flex",
      overflowX: "auto",
      flexDirection: "column",
    }),
    header: (options: IGridStyleOptions) => ({
      ...createGridRow(options),
      fontSize: 12,
      fontWeight: 600,
      padding: "0 20px",
      color: theme.palette.textMuted,
      top: 0,
      zIndex: 1,
      position: options.isSticky ? "sticky" : "static",
      backgroundColor: theme.glass.strong,
    }),
    row: ({ isDimmed, isClickable, ...options }: IRowStyleOptions) => ({
      ...createGridRow(options),
      minHeight: 72,
      padding: "10px 20px",
      alignItems: "center",
      borderRadius: theme.radius.panel,
      border: `1px solid ${theme.glass.border}`,
      boxShadow: theme.glass.shadowSmall,
      backgroundColor: theme.glass.strong,
      transition: "background-color 0.16s ease, box-shadow 0.16s ease",
      opacity: isDimmed ? DIMMED_ROW_OPACITY : 1,
      cursor: isClickable ? "pointer" : "default",
      "&:hover": isClickable ? { backgroundColor: theme.palette.surfaceHover } : {},
      "&:focus-visible": isClickable ? { outline: `2px solid ${theme.palette.primary}` } : {},
    }),
  });
