import type { Theme } from "@mui/material";
import { createStyles } from "../../create-styles";
import type { SystemStyleObject } from "@mui/system";
import { theme } from "../../constants/theme.constants";
import type { ChipSizeType, ChipVariantType } from "../../constants/chip.constant";

type TChipStyle = SystemStyleObject<Theme>;

const { palette, softShadow, radius, font } = theme;

const STYLE_BY_VARIANT: Record<ChipVariantType, TChipStyle> = {
  info: { backgroundColor: palette.airBlue, color: palette.charcoal },
  plain: { backgroundColor: "transparent", color: palette.charcoal },
  dark: { backgroundColor: palette.charcoal, color: palette.iceWhite, fontWeight: 700 },
  alert: { backgroundColor: palette.primary, color: palette.white, fontWeight: 700 },
  inset: { backgroundColor: palette.iceWhite, boxShadow: softShadow.insetSmall },
  raised: { backgroundColor: palette.iceWhite, boxShadow: softShadow.raisedSmall },
};

const STYLE_BY_SIZE: Record<ChipSizeType, TChipStyle> = {
  small: { height: 26, minWidth: 26, padding: "0 12px", fontSize: 12 },
  medium: { height: 32, minWidth: 32, padding: "0 14px", fontSize: 13 },
};

interface IChipStyleOptions {
  size: ChipSizeType;
  isMonospace: boolean;
  variant: ChipVariantType;
}

export const useStyles = () =>
  createStyles({
    chip: ({ variant, size, isMonospace }: IChipStyleOptions) => ({
      gap: "8px",
      fontWeight: 600,
      flexShrink: 0,
      whiteSpace: "nowrap",
      alignItems: "center",
      display: "inline-flex",
      justifyContent: "center",
      color: palette.charcoal,
      borderRadius: radius.pill,
      fontFamily: isMonospace ? font.mono : font.body,
      ...STYLE_BY_SIZE[size],
      ...STYLE_BY_VARIANT[variant],
    }),
  });
