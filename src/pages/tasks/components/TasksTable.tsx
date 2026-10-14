import {
  TASK_FILTER_IDS,
  TASKS_PAGE_COPY,
  type TaskStatusType,
  TASK_SCROLL_ROOT_MARGIN,
} from "../../../constants/task.constant";

import {
  useClaimTaskMutation,
  useUpdateTaskStatusMutation,
} from "../../../hooks/mutations/task.mutation";

import { type FC, useState } from "react";
import TaskMobileRow from "./TaskMobileRow";
import { useNavigate } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import Tabs from "../../../components/Tabs/Tabs";
import Card from "../../../components/Card/Card";
import { Box, useMediaQuery } from "@mui/material";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import DataTable from "../../../components/DataTable/DataTable";
import { buildTaskPath } from "../../../utilities/route.utility";
import type { IApiTask } from "../../../interfaces/task.interface";
import { useScrollReached } from "../../../hooks/scroll-reached.hook";
import InlineError from "../../../components/InlineError/InlineError";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import { MOBILE_LAYOUT_QUERY } from "../../../constants/layout.constant";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { buildTaskColumns, TASK_TABLE_MIN_WIDTH } from "../columns/task-columns";
import { useTasksQuery, useTaskCountsQuery } from "../../../hooks/queries/task.query";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { toTaskTabs, toTaskQuery, formatTaskSummary } from "../../../utilities/task.utility";

interface ITasksTableProps {
  isManager: boolean;
}

const getTaskId = (task: IApiTask) => task.id;

const TasksTable: FC<ITasksTableProps> = ({ isManager }) => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const isMobile = useMediaQuery(MOBILE_LAYOUT_QUERY);
  const [search, setSearch] = useState("");
  const [filterId, setFilterId] = useState<string>(TASK_FILTER_IDS.ALL);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const tasksQuery = useTasksQuery(toTaskQuery(filterId, debouncedSearch));
  const countsQuery = useTaskCountsQuery({});
  const statusMutation = useUpdateTaskStatusMutation();
  const claimMutation = useClaimTaskMutation();

  const tasks = (tasksQuery.data?.pages ?? []).flatMap(page => page.items);
  const counts = countsQuery.data ?? null;
  const isEmpty = tasksQuery.isSuccess && tasks.length === 0;
  const canLoadMore = tasksQuery.hasNextPage && !tasksQuery.isFetchingNextPage;
  const queryError =
    tasksQuery.error ?? countsQuery.error ?? statusMutation.error ?? claimMutation.error;

  const loadMoreRef = useScrollReached({
    isEnabled: canLoadMore,
    onReach: tasksQuery.fetchNextPage,
    rootMargin: TASK_SCROLL_ROOT_MARGIN,
  });

  const openTask = (task: IApiTask) => navigate(buildTaskPath(task.id));

  const changeStatus = (task: IApiTask, status: TaskStatusType) =>
    statusMutation.mutate({ taskId: task.id, status });

  const claimTask = (task: IApiTask) => claimMutation.mutate(task.id);

  const columns = buildTaskColumns({ isManager, onClaim: claimTask, onStatusChange: changeStatus });

  const toolbar = (
    <Box sx={styles.stack({ gap: "16px" })}>
      <Tabs activeId={filterId} onChange={setFilterId} items={toTaskTabs(counts)} />
      <Box sx={styles.spacedRow}>
        <Box sx={styles.flexItem({ basis: "0 1 460px" })}>
          <TextField
            value={search}
            onChange={setSearch}
            type={FIELD_TYPES.SEARCH}
            startIcon={ICON_NAMES.SEARCH}
            placeholder={TASKS_PAGE_COPY.SEARCH_PLACEHOLDER}
          />
        </Box>
      </Box>
      {queryError && <InlineError message={getApiErrorMessage(queryError)} />}
      {tasksQuery.isPending && <LoadingState label={TASKS_PAGE_COPY.LOADING} />}
      {isEmpty && (
        <Box component="span" sx={styles.caption}>
          {TASKS_PAGE_COPY.NO_RESULTS}
        </Box>
      )}
    </Box>
  );

  const footer = (
    <Box ref={loadMoreRef} sx={styles.stack({ gap: "8px" })}>
      {tasksQuery.isFetchingNextPage && <LoadingState label={TASKS_PAGE_COPY.LOADING_MORE} />}
      <Box component="span" sx={styles.caption}>
        {formatTaskSummary({ visible: tasks.length, total: counts?.total ?? 0 })}
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Card gap="16px">
        {toolbar}
        {tasks.map(task => (
          <TaskMobileRow task={task} key={task.id} onOpen={openTask} />
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
    />
  );
};

export default TasksTable;
