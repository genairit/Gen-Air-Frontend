import type { SegmentedSizeType } from "../constants/segmented.constant";

export interface ISegmentedOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface ISegmentedSizeStyle {
  gap: number;
  padding: number;
  fontSize: number;
  rootWidth: string;
  optionHeight: number;
  rootMinWidth: number;
  optionPaddingInline: number;
}

export interface ISegmentedRootStyleParams {
  disabled: boolean;
  size: SegmentedSizeType;
}

export interface ISegmentedTrackStyleParams {
  size: SegmentedSizeType;
}

export interface ISegmentedThumbStyleParams {
  optionsCount: number;
  selectedIndex: number;
  size: SegmentedSizeType;
}

export interface ISegmentedOptionStyleParams {
  isSelected: boolean;
  size: SegmentedSizeType;
}

export interface ISegmentedThumbGeometryParams {
  gap: number;
  optionsCount: number;
  selectedIndex: number;
}

export interface ISegmentedThumbGeometry {
  width: string;
  insetInlineStart: string;
}
