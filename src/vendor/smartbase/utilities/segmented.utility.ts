import type {
  ISegmentedOption,
  ISegmentedThumbGeometry,
  ISegmentedThumbGeometryParams,
} from "../interfaces/segmented.interface";

export const getSegmentedSelectedIndex = (options: ISegmentedOption[], value: string): number =>
  options.findIndex(option => option.value === value);

export const getSegmentedThumbGeometry = ({
  gap,
  optionsCount,
  selectedIndex,
}: ISegmentedThumbGeometryParams): ISegmentedThumbGeometry => {
  const totalGapsPx = gap * (optionsCount - 1);
  const optionWidth = `((100% - ${totalGapsPx}px) / ${optionsCount})`;

  return {
    width: `calc(${optionWidth})`,
    insetInlineStart: `calc(${selectedIndex} * (${optionWidth} + ${gap}px))`,
  };
};
