import type { FC } from "react";
import { SvgIcon, type SvgIconProps } from "@mui/material";

const SignatureIcon: FC<SvgIconProps> = ({ ...props }) => {
  return (
    <SvgIcon {...props} width="70" height="86" viewBox="0 0 70 86" fill="none">
      <path
        strokeWidth="5"
        stroke="#D9D9D9"
        strokeLinecap="round"
        d="M13.8285 41.2203C8.84673 41.1114 -3.558 53.6145 7.68826 55.2799C12.5218 55.9958 22.2401 51.4672 37.9443 48.4182C55.0168 45.1036 40.4753 59.6846 53.2235 58.2514C54.9509 58.3185 60.0976 57.4744 66.8656 53.5611"
      />
      <rect
        x="37.6851"
        y="9.97565"
        fill="#D9D9D9"
        width="14.0977"
        height="21.8753"
        stroke="#D9D9D9"
        transform="rotate(43.6494 37.6851 9.97565)"
      />
      <path
        fill="#D9D9D9"
        stroke="#D9D9D9"
        d="M49.0599 3.12276L54.1956 8.02187C55.5943 9.35611 55.6465 11.5716 54.3123 12.9702L51.734 15.6731L41.5333 5.94225L44.1116 3.23943C45.4458 1.84076 47.6613 1.78852 49.0599 3.12276Z"
      />
      <path
        strokeWidth="2"
        stroke="#D9D9D9"
        d="M22.5803 27.8724L30.7206 35.6377L21.1204 37.5522L22.5803 27.8724Z"
      />
    </SvgIcon>
  );
};

export default SignatureIcon;
