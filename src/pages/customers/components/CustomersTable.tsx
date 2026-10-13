import {
  getCustomerId,
  formatCustomerCount,
  countCustomersForFilter,
} from "../../../utilities/customer.utility";

import {
  CUSTOMERS_COPY,
  CUSTOMER_PAGE_SIZE,
  CUSTOMER_SYNC_FILTERS,
  ALL_CUSTOMERS_FILTER_ID,
} from "../../../constants/customer.constant";

import {
  useCustomersQuery,
  useCustomerSyncStatusCountsQuery,
} from "../../../hooks/queries/customer.query";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import Tabs from "../../../components/Tabs/Tabs";
import Card from "../../../components/Card/Card";
import { Box, useMediaQuery } from "@mui/material";
import CustomerMobileRow from "./CustomerMobileRow";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import DataTable from "../../../components/DataTable/DataTable";
import Pagination from "../../../components/Pagination/Pagination";
import { buildCustomerPath } from "../../../utilities/route.utility";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import InlineError from "../../../components/InlineError/InlineError";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import { MOBILE_LAYOUT_QUERY } from "../../../constants/layout.constant";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { getPageCount, getPageItems } from "../../../utilities/array.utility";
import { CUSTOMER_COLUMNS, CUSTOMER_TABLE_MIN_WIDTH } from "../columns/customer-columns";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

const CustomersTable = () => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const isMobile = useMediaQuery(MOBILE_LAYOUT_QUERY);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterId, setFilterId] = useState<string>(ALL_CUSTOMERS_FILTER_ID);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const activeFilter =
    CUSTOMER_SYNC_FILTERS.find(filter => filter.id === filterId) ?? CUSTOMER_SYNC_FILTERS[0];
  const customersQuery = useCustomersQuery({
    search: debouncedSearch,
    prioritySyncStatus: activeFilter.status,
  });
  const statusCountsQuery = useCustomerSyncStatusCountsQuery();

  const customers = customersQuery.data ?? [];
  const pageCount = getPageCount(customers.length, CUSTOMER_PAGE_SIZE);
  const currentPage = Math.min(page, pageCount);
  const pageCustomers = getPageItems(customers, {
    page: currentPage,
    pageSize: CUSTOMER_PAGE_SIZE,
  });
  const statusCounts = statusCountsQuery.data ?? null;
  const queryError = customersQuery.error ?? statusCountsQuery.error;
  const isEmpty = customersQuery.isSuccess && customers.length === 0;

  const filterTabs = CUSTOMER_SYNC_FILTERS.map(filter => ({
    id: filter.id,
    label: filter.label,
    count: countCustomersForFilter(statusCounts, filter),
  }));

  const openCustomer = (customer: IApiCustomer) => navigate(buildCustomerPath(customer.id));

  const handleFilterChange = (nextFilterId: string) => {
    setFilterId(nextFilterId);
    setPage(1);
  };

  const handleSearchChange = (nextSearch: string) => {
    setSearch(nextSearch);
    setPage(1);
  };

  const toolbar = (
    <Box sx={styles.stack({ gap: "16px" })}>
      <Box sx={styles.spacedRow}>
        <Tabs items={filterTabs} activeId={filterId} onChange={handleFilterChange} />
        <Box sx={styles.flexItem({ basis: "0 1 420px" })}>
          <TextField
            value={search}
            type={FIELD_TYPES.SEARCH}
            onChange={handleSearchChange}
            startIcon={ICON_NAMES.SEARCH}
            placeholder={CUSTOMERS_COPY.SEARCH_PLACEHOLDER}
          />
        </Box>
      </Box>
      {queryError && <InlineError message={getApiErrorMessage(queryError)} />}
      {customersQuery.isPending && <LoadingState label={CUSTOMERS_COPY.LOADING} />}
      {isEmpty && (
        <Box component="span" sx={styles.caption}>
          {CUSTOMERS_COPY.EMPTY}
        </Box>
      )}
    </Box>
  );

  const footer = (
    <Box sx={styles.spacedRow}>
      <Box component="span" sx={styles.caption}>
        {formatCustomerCount({ visible: pageCustomers.length, total: customers.length })}
      </Box>
      <Pagination
        onChange={setPage}
        page={currentPage}
        pageCount={pageCount}
        nextLabel={CUSTOMERS_COPY.NEXT_PAGE}
        previousLabel={CUSTOMERS_COPY.PREVIOUS_PAGE}
      />
    </Box>
  );

  if (isMobile) {
    return (
      <Card gap="16px">
        {toolbar}
        {pageCustomers.map(customer => (
          <CustomerMobileRow key={customer.id} customer={customer} onOpen={openCustomer} />
        ))}
        {footer}
      </Card>
    );
  }

  return (
    <DataTable
      footer={footer}
      toolbar={toolbar}
      rows={pageCustomers}
      getRowId={getCustomerId}
      onRowClick={openCustomer}
      columns={CUSTOMER_COLUMNS}
      minWidth={CUSTOMER_TABLE_MIN_WIDTH}
    />
  );
};

export default CustomersTable;
