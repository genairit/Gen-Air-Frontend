import {
  formatApartmentResults,
  formatVisibleApartments,
} from "../../../../utilities/apartment.utility";

import {
  BUILDING_PAGE_COPY,
  APARTMENT_SCROLL_ROOT_MARGIN,
} from "../../../../constants/apartment.constant";

import { type FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, useMediaQuery } from "@mui/material";
import { usePageStyles } from "../../../page.style";
import Card from "../../../../components/Card/Card";
import ApartmentMobileRow from "./ApartmentMobileRow";
import ApartmentSelectionBar from "./ApartmentSelectionBar";
import { ICON_NAMES } from "../../../../constants/icon.constant";
import TextField from "../../../../components/TextField/TextField";
import DataTable from "../../../../components/DataTable/DataTable";
import { useIdSelection } from "../../../../hooks/id-selection.hook";
import { useScrollReached } from "../../../../hooks/scroll-reached.hook";
import { buildApartmentPath } from "../../../../utilities/route.utility";
import InlineError from "../../../../components/InlineError/InlineError";
import { SEARCH_DEBOUNCE_MS } from "../../../../constants/search.constant";
import { useDebouncedValue } from "../../../../hooks/debounced-value.hook";
import { MOBILE_LAYOUT_QUERY } from "../../../../constants/layout.constant";
import LoadingState from "../../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../../utilities/api-error.utility";
import { useApartmentPagesQuery } from "../../../../hooks/queries/apartment.query";
import type { IApiProject, IApiProjectStage } from "../../../../interfaces/api.interface";
import { FIELD_TYPES } from "../../../../components/TextField/constants/textfield.constants";
import { buildApartmentColumns, APARTMENT_TABLE_MIN_WIDTH } from "./columns/apartment-columns";

interface IApartmentsTableProps {
  buildingId: string;
  stageId: string | null;
  stages: IApiProjectStage[];
}

const getApartmentId = (apartment: IApiProject) => apartment.id;

const ApartmentsTable: FC<IApartmentsTableProps> = ({ buildingId, stageId, stages }) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const isMobile = useMediaQuery(MOBILE_LAYOUT_QUERY);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const apartmentsQuery = useApartmentPagesQuery(buildingId, { search: debouncedSearch, stageId });

  const pages = apartmentsQuery.data?.pages ?? [];
  const apartments = pages.flatMap(page => page.items);
  const total = pages[0]?.total ?? 0;
  const selection = useIdSelection(apartments.map(getApartmentId));
  const hasSelection = selection.selectedIds.length > 0;
  const isFiltered = Boolean(debouncedSearch.trim()) || stageId !== null;
  const isEmpty = apartmentsQuery.isSuccess && apartments.length === 0;
  const canLoadMore = apartmentsQuery.hasNextPage && !apartmentsQuery.isFetchingNextPage;

  const loadMoreRef = useScrollReached({
    isEnabled: canLoadMore,
    rootMargin: APARTMENT_SCROLL_ROOT_MARGIN,
    onReach: apartmentsQuery.fetchNextPage,
  });

  const columns = buildApartmentColumns({ stages, selection });
  const openApartment = (apartment: IApiProject) =>
    navigate(buildApartmentPath(buildingId, apartment.id));

  const toolbar = (
    <Box sx={styles.stack({ gap: "16px" })}>
      <Box sx={styles.spacedRow}>
        <Box sx={styles.row({ gap: "8px" })}>
          <Box component="b">{BUILDING_PAGE_COPY.APARTMENTS_TITLE}</Box>
          <Box component="span" sx={styles.caption}>
            {formatApartmentResults(total)}
          </Box>
        </Box>
        <Box sx={styles.flexItem({ basis: "0 1 460px" })}>
          <TextField
            value={search}
            onChange={setSearch}
            type={FIELD_TYPES.SEARCH}
            startIcon={ICON_NAMES.SEARCH}
            placeholder={BUILDING_PAGE_COPY.SEARCH_PLACEHOLDER}
          />
        </Box>
      </Box>
      {hasSelection && (
        <ApartmentSelectionBar
          stages={stages}
          onClear={selection.clear}
          apartmentIds={selection.selectedIds}
        />
      )}
      {apartmentsQuery.isError && (
        <InlineError message={getApiErrorMessage(apartmentsQuery.error)} />
      )}
      {apartmentsQuery.isPending && <LoadingState label={BUILDING_PAGE_COPY.LOADING} />}
      {isEmpty && (
        <Box component="span" sx={styles.caption}>
          {isFiltered ? BUILDING_PAGE_COPY.NO_RESULTS : BUILDING_PAGE_COPY.EMPTY_DESCRIPTION}
        </Box>
      )}
    </Box>
  );

  const footer = (
    <Box ref={loadMoreRef} sx={styles.stack({ gap: "8px" })}>
      {apartmentsQuery.isFetchingNextPage && (
        <LoadingState label={BUILDING_PAGE_COPY.LOADING_MORE} />
      )}
      <Box component="span" sx={styles.caption}>
        {formatVisibleApartments({ visible: apartments.length, total })}
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Card gap="16px">
        {toolbar}
        {apartments.map(apartment => (
          <ApartmentMobileRow
            stages={stages}
            key={apartment.id}
            apartment={apartment}
            onOpen={openApartment}
          />
        ))}
        {footer}
      </Card>
    );
  }

  return (
    <DataTable
      footer={footer}
      columns={columns}
      toolbar={toolbar}
      rows={apartments}
      getRowId={getApartmentId}
      onRowClick={openApartment}
      minWidth={APARTMENT_TABLE_MIN_WIDTH}
    />
  );
};

export default ApartmentsTable;
