import type { FC } from "react";
import { Box } from "@mui/material";
import genairLogo from "../../assets/genair-logo.png";
import { BRAND } from "../../constants/navigation.constant";

interface IBrandLogoProps {
  alt?: string;
  width: string;
}

const BrandLogo: FC<IBrandLogoProps> = ({ width, alt = BRAND.TITLE }) => (
  <Box
    alt={alt}
    component="img"
    src={genairLogo}
    sx={{ width, height: "auto", display: "block" }}
  />
);

export default BrandLogo;
