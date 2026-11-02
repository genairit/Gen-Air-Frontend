import type { FC } from "react";
import { theme } from "../theme";
import { SvgIcon, type SvgIconProps } from "@mui/material";

const Success: FC<SvgIconProps> = ({ htmlColor = theme.status.success, ...props }) => {
  return (
    <SvgIcon viewBox="0 0 256 256" htmlColor={htmlColor} {...props}>
      <path
        fill="currentColor"
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m45.66 85.66l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32"
      />
    </SvgIcon>
  );
};

export default Success;
