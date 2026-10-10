import {
  SeverityLevels,
  SEVERITY_LEVEL_COLORS,
} from "../constants/colors.constants";

export interface IHelperText {
  text: string;
  color: string;
}

interface IHelperTextParams {
  infoText?: string;
  errorText?: string;
  warningText?: string;
}

export const getHelperText = ({
  errorText,
  warningText,
  infoText,
}: IHelperTextParams): IHelperText => {
  const levels = [
    {
      text: errorText || "",
      color: SEVERITY_LEVEL_COLORS[SeverityLevels.ERROR],
    },
    {
      text: warningText || "",
      color: SEVERITY_LEVEL_COLORS[SeverityLevels.WARNING],
    },
    {
      text: infoText || "",
      color: SEVERITY_LEVEL_COLORS[SeverityLevels.INFO],
    },
  ];

  return levels.find((item) => item.text) || levels[levels.length - 1];
};