import { createStyles } from "../../../create-styles";
import type { IFreeTextChipPalette } from "../../../interfaces/free-text.interface";

interface IStylesParams {
  palette: IFreeTextChipPalette;
}

export const useStyles = ({ palette }: IStylesParams) =>
  createStyles({
    chip: {
      gap: "8px",
      lineHeight: 1,
      fontSize: "15px",
      cursor: "pointer",
      borderWidth: "1px",
      borderStyle: "solid",
      whiteSpace: "nowrap",
      borderRadius: "7px",
      padding: "5px 8px",
      alignItems: "center",
      display: "inline-flex",
      color: palette.foreground,
      borderColor: palette.border,
      backgroundColor: palette.background,
    },
    chipWord: {
      lineHeight: 1,
    },
    chipRemove: {
      opacity: 0.5,
      lineHeight: 1,
      cursor: "pointer",
      fontSize: "16px",
      alignItems: "center",
      display: "inline-flex",
      "&:hover": {
        opacity: 1,
      },
    },
  });
