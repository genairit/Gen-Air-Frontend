import type { FC } from "react";
import { theme } from "../theme";
import { SvgIcon, type SvgIconProps } from "@mui/material";

const Warning: FC<SvgIconProps> = ({ htmlColor = theme.status.warning, ...props }) => {
  return (
    <SvgIcon viewBox="0 0 256 256" htmlColor={htmlColor} {...props}>
      <path
        fill="currentColor"
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-8 56a8 8 0 0 1 16 0v56a8 8 0 0 1-16 0Zm8 104a12 12 0 1 1 12-12a12 12 0 0 1-12 12"
      />
    </SvgIcon>
  );
};

export default Warning;
