import { theme } from "../../../theme";
import { alpha } from "@mui/material/styles";
import { mixColors } from "../../../utilities/color.utility";
import { NOTICE_PALETTE_WEIGHTS } from "../constants/notice-card.constant";

export interface INoticeToneOptions {
  tone: string;
  inkWeight: number;
}

export interface INoticePalette {
  color: string;
  borderColor: string;
  backgroundColor: string;
}

export const getNoticePalette = ({ tone, inkWeight }: INoticeToneOptions): INoticePalette => ({
  color: mixColors(tone, theme.text.primary, inkWeight),
  borderColor: alpha(tone, NOTICE_PALETTE_WEIGHTS.BORDER_OPACITY),
  backgroundColor: mixColors(tone, theme.colors.white, NOTICE_PALETTE_WEIGHTS.BACKGROUND_TONE),
});
