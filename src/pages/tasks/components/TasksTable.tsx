import {
  getTaskId,
  toTaskTabs,
  toSortedTaskQuery,
  formatTaskSummary,
} from "../../../utilities/task.utility";

import {
  TASK_FILTER_IDS,
  TASKS_PAGE_COPY,
  TASK_SCROLL_ROOT_MARGIN,
} from "../../../constants/task.constant";

import {
  TASK_SORTS,
  TASK_SORT_COPY,
  TASK_SORT_OPTIONS,
  type TaskSortType,
} from "../../../constants/task-sort.constant";

import { type FC, useState } from "react";
import TaskMobileRow from "./TaskMobileRow";
import { useStyles } from "./TasksTable.style";
import { useNavigate } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import Tabs from "../../../components/Tabs/Tabs";
import Card from "../../../components/Card/Card";
import { Box, useMediaQuery } from "@mui/material";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import DataTable from "../../../components/DataTable/DataTable";
import { buildTaskPath } from "../../../utilities/route.utility";
import { toTaskSort } from "../../../utilities/task-sort.utility";
import type { IApiTask } from "../../../interfaces/task.interface";
import SelectField from "../../../components/SelectField/SelectField";
import { useScrollReached } from "../../../hooks/scroll-reached.hook";
import InlineError from "../../../components/InlineError/InlineError";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import { MOBILE_LAYOUT_QUERY } from "../../../constants/layout.constant";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { retryTaskQueriesAction } from "../../../actions/task-query.action";
import { useClaimTaskMutation } from "../../../hooks/mutations/task.mutation";
import { buildTaskColumns, TASK_TABLE_MIN_WIDTH } from "../columns/task-columns";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { useMyTasksQuery, useMyTaskCountsQuery } from "../../../hooks/queries/task.query";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface ITasksTableProps {
  canClaim: boolean;
  onEdit: ((task: IApiTask) => void) | null;
}

const TasksTable: FC<ITasksTableProps> = ({ canClaim, onEdit }) => {
  const styles = usePageStyles();
  const toolbarStyles = styles.row({ gap: "12px" });
  const searchStyles = styles.flexItem({ basis: "3 1 300px" });
  const tableStyles = useStyles();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MOBILE_LAYOUT_QUERY);
  const [search, setSearch] = useState("");
  const [filterId, setFilterId] = useState<string>(TASK_FILTER_IDS.ALL);
  const [sort, setSort] = useState<TaskSortType>(TASK_SORTS.DEFAULT);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const query = toSortedTaskQuery({ filterId, search: debouncedSearch, sort });
  const tasksQuery = useMyTasksQuery(query);
  const countsQuery = useMyTaskCountsQuery();
  const claimMutation = useClaimTaskMutation();

  const tasks = (tasksQuery.data?.pages ?? []).flatMap(page => page.items);
  const counts = countsQuery.data ?? null;
  const isEmpty = tasksQuery.isSuccess && tasks.length === 0;
  const canLoadMore = tasksQuery.hasNextPage && !tasksQuery.isFetchingNextPage;
  const queryError = tasksQuery.error ?? countsQuery.error ?? claimMutation.error;
  const errorMessage = getApiErrorMessage(queryError);
  const hasError = queryError !== null;
  const canRetryQuery = tasksQuery.isError || countsQuery.isError;
  const isRetrying = tasksQuery.isFetching || countsQuery.isFetching;
  const tabs = toTaskTabs(counts);
  const summary = formatTaskSummary({ visible: tasks.length, total: counts?.total ?? 0, sort });

  const loadMoreRef = useScrollReached({
    isEnabled: canLoadMore,
    onReach: tasksQuery.fetchNextPage,
    rootMargin: TASK_SCROLL_ROOT_MARGIN,
  });

  const openTask = (task: IApiTask) => navigate(buildTaskPath(task.id));

  const claimTask = (task: IApiTask) => claimMutation.mutate(task.id);

  const retryQueries = () =>
    retryTaskQueriesAction({
      refetchTasks: tasksQuery.refetch,
      refetchCounts: countsQuery.refetch,
    });

  const columns = buildTaskColumns({
    canClaim,
    onEdit,
    onClaim: claimTask,
  });

  const toolbar = (
    <Box sx={styles.stack({ gap: "16px" })}>
      <Box sx={toolbarStyles}>
        <Box sx={searchStyles}>
          <TextField
            compact
            value={search}
            onChange={setSearch}
            type={FIELD_TYPES.SEARCH}
            startIcon={ICON_NAMES.SEARCH}
            placeholder={TASKS_PAGE_COPY.SEARCH_PLACEHOLDER}
            slotProps={{ htmlInput: { "aria-label": TASKS_PAGE_COPY.SEARCH_LABEL } }}
          />
        </Box>
        <Box sx={tableStyles.sort}>
          <SelectField
            compact
            value={sort}
            items={TASK_SORT_OPTIONS}
            ariaLabel={TASK_SORT_COPY.LABEL}
            onChange={event => setSort(toTaskSort(event.target.value))}
          />
        </Box>
      </Box>
      <Box sx={tableStyles.filters}>
        <Tabs
          items={tabs}
          activeId={filterId}
          onChange={setFilterId}
          ariaLabel={TASKS_PAGE_COPY.FILTER_LABEL}
        />
      </Box>
      {hasError && <InlineError message={errorMessage} />}
      {canRetryQuery && (
        <Box sx={styles.row({ gap: "8px" })}>
          <Button
            disabled={isRetrying}
            onClick={retryQueries}
            text={TASK_SORT_COPY.RETRY}
            variant={BUTTON_VARIANTS.NEUTRAL}
          />
        </Box>
      )}
      {tasksQuery.isPending && <LoadingState label={TASKS_PAGE_COPY.LOADING} />}
    </Box>
  );

  const footer = (
    <Box ref={loadMoreRef} sx={styles.stack({ gap: "8px" })}>
      {tasksQuery.isFetchingNextPage && <LoadingState label={TASKS_PAGE_COPY.LOADING_MORE} />}
      {isEmpty && (
        <Box component="span" sx={styles.caption}>
          {TASKS_PAGE_COPY.NO_RESULTS}
        </Box>
      )}
      {tasks.length > 0 && (
        <Box component="span" sx={styles.caption}>
          {summary}
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Card gap="16px" ariaLabel={TASKS_PAGE_COPY.TITLE}>
        {toolbar}
        {tasks.map(task => (
          <TaskMobileRow task={task} key={task.id} onEdit={onEdit} onOpen={openTask} />
        ))}
        {footer}
      </Card>
    );
  }

  return (
    <DataTable
      rows={tasks}
      footer={footer}
      columns={columns}
      toolbar={toolbar}
      getRowId={getTaskId}
      onRowClick={openTask}
      minWidth={TASK_TABLE_MIN_WIDTH}
      ariaLabel={TASKS_PAGE_COPY.TITLE}
    />
  );
};

export default TasksTable;
