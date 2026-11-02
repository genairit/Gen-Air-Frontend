import { decomposeColor, recomposeColor } from "@mui/material/styles";

const mixChannel = (colorValue: number, baseValue: number, weight: number): number =>
  Math.round(colorValue * weight + baseValue * (1 - weight));

export const mixColors = (color: string, base: string, weight: number): string => {
  const colorChannels = decomposeColor(color).values;
  const baseChannels = decomposeColor(base).values;

  const values: [number, number, number] = [
    mixChannel(colorChannels[0], baseChannels[0], weight),
    mixChannel(colorChannels[1], baseChannels[1], weight),
    mixChannel(colorChannels[2], baseChannels[2], weight),
  ];

  return recomposeColor({ type: "rgb", values });
};
