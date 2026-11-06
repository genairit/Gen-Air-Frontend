import { createStyles } from "../../create-styles";
import type { INoticePalette } from "./utilities/notice-palette.utility";
import { STYLE_BY_SIZE, type TNoticeSize } from "./constants/notice-card.constant";

interface IStylesParams {
  size: TNoticeSize;
  palette: INoticePalette;
}

export const useStyles = ({ size, palette }: IStylesParams) =>
  createStyles({
    noticeCard: {
      width: "100%",
      display: "flex",
      textAlign: "start",
      border: "1px solid",
      borderRadius: "12px",
      boxSizing: "border-box",
      alignItems: "flex-start",

      ...STYLE_BY_SIZE[size],
      ...palette,
    },
    icon: {
      flexShrink: 0,
      height: "25px",
      display: "flex",
      fontSize: "26px",
      alignItems: "flex-end",
    },
    textContent: {
      flex: 1,
      minWidth: 0,
      color: "inherit",
      fontSize: "15px",
      lineHeight: 1.45,
      textAlign: "start",
    },
  });
