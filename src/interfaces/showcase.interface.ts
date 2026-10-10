import type { SurfaceDepthType } from "../constants/surface.constant";
import type { ChipSizeType, ChipVariantType } from "../constants/chip.constant";

export interface IColorSwatch {
  name: string;
  color: string;
  usage: string;
  isInsetPreview?: boolean;
}

export interface ITypographySample {
  label: string;
  fontSize: number;
  fontWeight: number;
}

export interface IDepthSample {
  label: string;
  depth: SurfaceDepthType;
}

export interface IChipSample {
  label: string;
  dotColor?: string;
  size?: ChipSizeType;
  isMonospace?: boolean;
  variant: ChipVariantType;
}
