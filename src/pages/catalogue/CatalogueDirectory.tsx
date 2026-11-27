import { useState } from "react";
import { usePageStyles } from "../page.style";
import Card from "../../components/Card/Card";
import { Box, useMediaQuery } from "@mui/material";
import Button from "../../components/Button/Button";
import { useCatalogueStyles } from "./catalogue.style";
import { CatalogueItemName } from "./CatalogueItemName";
import { CATALOGUE_COLUMNS } from "./catalogue-columns";
import CheckBox from "../../components/CheckBox/CheckBox";
import { ICON_NAMES } from "../../constants/icon.constant";
import ChoiceRow from "../../components/ChoiceRow/ChoiceRow";
import DataTable from "../../components/DataTable/DataTable";
import TextField from "../../components/TextField/TextField";
import InlineError from "../../components/InlineError/InlineError";
import { useCatalogueDirectory } from "../../hooks/catalogue.hook";
import { SEARCH_DEBOUNCE_MS } from "../../constants/search.constant";
import { useDebouncedValue } from "../../hooks/debounced-value.hook";
import LoadingState from "../../components/LoadingState/LoadingState";
import { MOBILE_LAYOUT_QUERY } from "../../constants/layout.constant";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import type { ICatalogueItem } from "../../interfaces/quotation.interface";
import { FIELD_TYPES } from "../../components/TextField/constants/textfield.constants";
import { cataloguePrice, catalogueCapacity, catalogueRowLabel } from "./catalogue-display.utility";

interface ICatalogueDirectoryProps {
  canManage: boolean;
  onOpen: (item: ICatalogueItem) => void;
}

const SEARCH_LABEL = "חיפוש לפי מק״ט, תיאור או BTU";
const LIST_LABEL = "רשימת פריטי קטלוג";

const CatalogueDirectory = ({ canManage, onOpen }: ICatalogueDirectoryProps) => {
  const page = usePageStyles();
  const styles = useCatalogueStyles();
  const isMobile = useMediaQuery(MOBILE_LAYOUT_QUERY);
  const [search, setSearch] = useState("");
  const [pricedOnly, setPricedOnly] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const query = useCatalogueDirectory({ search: debouncedSearch, pricedOnly, canManage });
  const rows = query.data?.pages.flatMap(batch => batch.items) ?? [];

  const toolbar = (
    <Box sx={styles.filters}>
      <Box sx={styles.search}>
        <TextField
          value={search}
          maxLength={200}
          onChange={setSearch}
          type={FIELD_TYPES.SEARCH}
          placeholder={SEARCH_LABEL}
          startIcon={ICON_NAMES.SEARCH}
          slotProps={{ htmlInput: { "aria-label": SEARCH_LABEL } }}
        />
      </Box>
      <CheckBox value={pricedOnly} text="רק פריטים עם מחיר" onChange={setPricedOnly} />
    </Box>
  );

  const feedback = (
    <>
      {query.isPending && <LoadingState label="טוען פריטי קטלוג" />}
      {query.isError && (
        <Box sx={page.stack({ gap: "10px" })}>
          <InlineError message={getApiErrorMessage(query.error)} />
          <Box>
            <Button
              text="נסו שוב"
              onClick={async () => {
                await query.refetch();
              }}
            />
          </Box>
        </Box>
      )}
      {query.isSuccess && rows.length === 0 && (
        <Box role="status" sx={page.caption}>
          {debouncedSearch || pricedOnly
            ? "לא נמצאו פריטים שתואמים לחיפוש"
            : "אין פריטי קטלוג להצגה"}
        </Box>
      )}
    </>
  );

  const footer = rows.length > 0 && (
    <Box sx={page.spacedRow}>
      <Box role="status" component="span" sx={page.caption}>
        {query.hasNextPage ? `מוצגים ${rows.length} פריטים עד כה` : `מוצגים ${rows.length} פריטים`}
      </Box>
      {query.hasNextPage && (
        <Button
          text="טענו עוד"
          disabled={query.isFetchingNextPage}
          isLoading={query.isFetchingNextPage}
          onClick={async () => {
            await query.fetchNextPage();
          }}
        />
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Card ariaLabel={LIST_LABEL}>
        {toolbar}
        {rows.map(item => (
          <ChoiceRow
            key={item.id}
            sx={styles.mobileRow}
            onClick={() => onOpen(item)}
            aria-label={catalogueRowLabel(item)}
          >
            <CatalogueItemName item={item} />
            <Box component="bdi">{item.sku}</Box>
            <Box component="span" sx={styles.mobileMetadata}>
              <Box component="bdi">{catalogueCapacity(item.capacityBtu)}</Box>
              <Box component="span">{item.unit || "—"}</Box>
              <Box component="strong">
                <Box component="bdi">{cataloguePrice(item.price)}</Box>
              </Box>
            </Box>
          </ChoiceRow>
        ))}
        {feedback}
        {footer}
      </Card>
    );
  }

  return (
    <DataTable
      rows={rows}
      minWidth={625}
      footer={footer}
      toolbar={toolbar}
      onRowClick={onOpen}
      ariaLabel={LIST_LABEL}
      endAdornment={feedback}
      getRowId={item => item.id}
      columns={CATALOGUE_COLUMNS}
      getRowLabel={catalogueRowLabel}
    />
  );
};

export default CatalogueDirectory;
