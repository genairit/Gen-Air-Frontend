import { Box } from "@mui/material";
import { CatalogueItemName } from "./CatalogueItemName";
import type { ICatalogueItem } from "../../interfaces/quotation.interface";
import type { IDataTableColumn } from "../../interfaces/data-table.interface";
import { cataloguePrice, catalogueCapacity } from "./catalogue-display.utility";

const itemText = { fontSize: 16, fontWeight: 700, overflowWrap: "anywhere" };

const catalogueColumnHeading = (label: string) => (
  <Box component="span" sx={{ fontSize: 14, fontWeight: 700 }}>
    {label}
  </Box>
);

export const CATALOGUE_COLUMNS: IDataTableColumn<ICatalogueItem>[] = [
  {
    id: "sku",
    header: catalogueColumnHeading("מק״ט"),
    track: "minmax(120px, 1.3fr)",
    render: row => (
      <Box sx={itemText} component="bdi">
        {row.sku}
      </Box>
    ),
  },
  {
    id: "description",
    header: catalogueColumnHeading("תיאור"),
    track: "minmax(220px, 4fr)",
    render: row => <CatalogueItemName item={row} />,
  },
  {
    id: "capacity",
    header: catalogueColumnHeading("תפוקה (BTU)"),
    track: "minmax(105px, 1fr)",
    render: row => <Box component="bdi">{catalogueCapacity(row.capacityBtu)}</Box>,
  },
  {
    id: "unit",
    header: catalogueColumnHeading("יחידה"),
    track: "minmax(60px, .65fr)",
    render: row => row.unit || "—",
  },
  {
    id: "price",
    header: catalogueColumnHeading("מחיר"),
    track: "minmax(100px, 1fr)",
    render: row => (
      <Box sx={itemText} component="bdi">
        {cataloguePrice(row.price)}
      </Box>
    ),
  },
];
