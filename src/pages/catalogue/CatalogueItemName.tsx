import { Box } from "@mui/material";
import { theme } from "../../constants/theme.constants";
import { catalogueStatusLabel } from "./catalogue-display.utility";
import type { ICatalogueItem } from "../../interfaces/quotation.interface";

export const CatalogueItemName = ({ item }: { item: ICatalogueItem }) => {
  const status = catalogueStatusLabel(item.status);
  return (
    <Box component="span" sx={{ fontSize: 16, fontWeight: 700, overflowWrap: "anywhere" }}>
      {item.description || item.sku}
      {status && (
        <Box
          component="span"
          sx={{ marginInlineStart: "8px", fontSize: 13, color: theme.palette.textMuted }}
        >
          {status}
        </Box>
      )}
    </Box>
  );
};
