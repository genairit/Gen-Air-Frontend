import type { FC } from "react";
import { Box } from "@mui/material";
import genairLogo from "../../assets/genair-logo.png";
import { BRAND } from "../../constants/navigation.constant";

interface IBrandLogoProps {
  width: string;
}

const BrandLogo: FC<IBrandLogoProps> = ({ width }) => (
  <Box
    component="img"
    src={genairLogo}
    alt={BRAND.TITLE}
    sx={{ width, height: "auto", display: "block" }}
  />
);

export default BrandLogo;
