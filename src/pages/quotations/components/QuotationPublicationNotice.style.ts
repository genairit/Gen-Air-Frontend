import type { SxProps, Theme } from "@mui/material";
import { createStyles } from "../../../create-styles";

interface IQuotationPublicationStyles {
  actions: SxProps<Theme>;
  progress: SxProps<Theme>;
}
export const useStyles = (): IQuotationPublicationStyles =>
  createStyles({
    actions: { gap: "8px", minWidth: 0, display: "flex", flexWrap: "wrap", alignItems: "center" },
    progress: {
      "@media (prefers-reduced-motion: reduce)": {
        animation: "none",
        "& .MuiCircularProgress-circle": { animation: "none" },
      },
    },
  });
