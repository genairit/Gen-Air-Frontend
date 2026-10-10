import {
  getEmployeeId,
  isEmployeeDisabled,
  countUsersForFilter,
} from "../../../utilities/employee.utility";

import {
  EMPLOYEES_COPY,
  EMPLOYEE_FILTERS,
  EMPLOYEE_PAGE_SIZE,
  ALL_EMPLOYEES_FILTER_ID,
} from "../../../constants/employee.constant";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { usePageStyles } from "../../page.style";
import Tabs from "../../../components/Tabs/Tabs";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import DataTable from "../../../components/DataTable/DataTable";
import Pagination from "../../../components/Pagination/Pagination";
import { toEmployee } from "../../../utilities/mappers/user.mapper";
import { formatVisibleCount } from "../../../utilities/text.utility";
import InlineError from "../../../components/InlineError/InlineError";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { getPageCount, getPageItems } from "../../../utilities/array.utility";
import { useRemoveEmployeeMutation } from "../../../hooks/mutations/user.mutation";
import { useUsersQuery, useUserRoleCountsQuery } from "../../../hooks/queries/user.query";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { createEmployeeColumns, EMPLOYEE_TABLE_MIN_WIDTH } from "../columns/employee-columns";

interface IEmployeesTableProps {
  canManageUsers: boolean;
}

const EmployeesTable: FC<IEmployeesTableProps> = ({ canManageUsers }) => {
  const styles = usePageStyles();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterId, setFilterId] = useState<string>(ALL_EMPLOYEES_FILTER_ID);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const activeFilter =
    EMPLOYEE_FILTERS.find(filter => filter.id === filterId) ?? EMPLOYEE_FILTERS[0];
  const usersQuery = useUsersQuery({ search: debouncedSearch, role: activeFilter.role });
  const roleCountsQuery = useUserRoleCountsQuery();
  const removeMutation = useRemoveEmployeeMutation();

  const employees = (usersQuery.data ?? []).map(toEmployee);
  const pageCount = getPageCount(employees.length, EMPLOYEE_PAGE_SIZE);
  const currentPage = Math.min(page, pageCount);
  const pageEmployees = getPageItems(employees, {
    page: currentPage,
    pageSize: EMPLOYEE_PAGE_SIZE,
  });
  const totalUsers = countUsersForFilter(roleCountsQuery.data ?? null, EMPLOYEE_FILTERS[0]);
  const actionError = removeMutation.error ?? usersQuery.error;

  const filterTabs = EMPLOYEE_FILTERS.map(filter => ({
    id: filter.id,
    label: filter.label,
    count: countUsersForFilter(roleCountsQuery.data ?? null, filter),
  }));

  const columns = createEmployeeColumns({
    canManage: canManageUsers,
    onDelete: employee => removeMutation.mutate(employee.id),
  });

  const handleFilterChange = (nextFilterId: string) => {
    setFilterId(nextFilterId);
    setPage(1);
  };

  const handleSearchChange = (nextSearch: string) => {
    setSearch(nextSearch);
    setPage(1);
  };

  return (
    <DataTable
      columns={columns}
      rows={pageEmployees}
      getRowId={getEmployeeId}
      isRowDimmed={isEmployeeDisabled}
      minWidth={EMPLOYEE_TABLE_MIN_WIDTH}
      footer={
        <Box sx={styles.spacedRow}>
          <Box component="span" sx={styles.caption}>
            {formatVisibleCount({ visible: pageEmployees.length, total: totalUsers })}
          </Box>
          <Pagination
            onChange={setPage}
            page={currentPage}
            pageCount={pageCount}
            nextLabel={EMPLOYEES_COPY.NEXT_PAGE}
            previousLabel={EMPLOYEES_COPY.PREVIOUS_PAGE}
          />
        </Box>
      }
      toolbar={
        <Box sx={styles.stack({ gap: "16px" })}>
          <Box sx={styles.spacedRow}>
            <Tabs items={filterTabs} activeId={filterId} onChange={handleFilterChange} />
            <Box sx={styles.flexItem({ basis: "0 1 360px" })}>
              <TextField
                value={search}
                type={FIELD_TYPES.SEARCH}
                onChange={handleSearchChange}
                startIcon={ICON_NAMES.SEARCH}
                placeholder={EMPLOYEES_COPY.SEARCH_PLACEHOLDER}
              />
            </Box>
          </Box>
          {actionError && <InlineError message={getApiErrorMessage(actionError)} />}
          {usersQuery.isPending && <LoadingState label={EMPLOYEES_COPY.LOADING} />}
        </Box>
      }
    />
  );
};

export default EmployeesTable;
