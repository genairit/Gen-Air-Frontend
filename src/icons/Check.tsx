import type { FC } from "react";
import { SvgIcon, type SvgIconProps } from "@mui/material";

const Check: FC<SvgIconProps> = ({ ...props }) => {
  return (
    <SvgIcon
      width="13"
      height="10"
      fill="none"
      viewBox="-5 0 23 10"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="currentColor"
        d="M4.5 9.8093L0.5 5.8093L1.9 4.4093L4.5 7.0093L11.1 0.409302L12.5 1.8093L4.5 9.8093Z"
      />
    </SvgIcon>
  );
};

export default Check;
