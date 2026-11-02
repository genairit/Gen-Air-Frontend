import { type FC } from "react";
import { SvgIcon, type SvgIconProps } from "@mui/material";

const ChevronDownIcon: FC<SvgIconProps> = props => (
  <SvgIcon viewBox="0 0 256 256" {...props}>
    <path
      fill="currentColor"
      d="m213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32"
    />
  </SvgIcon>
);

export default ChevronDownIcon;
