import {
  findLinkOption,
  getProjectCustomer,
  toProjectLinkOption,
} from "../../../utilities/task.utility";

import {
  TASK_PROJECT_PICKER_COPY,
  TASK_PROJECT_RESULT_LIMIT,
} from "../../../constants/task.constant";

import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import { type FC, useState } from "react";
import { useStyles } from "./TaskForm.style";
import TaskLinkPicker from "./TaskLinkPicker";
import TaskLinkSelection from "./TaskLinkSelection";
import { useSessionUser } from "../../../store/session.store";
import TaskLinkSelectionStatus from "./TaskLinkSelectionStatus";
import TaskProjectCustomerNote from "./TaskProjectCustomerNote";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import { NEW_TASK_COPY } from "../../../constants/task.constant";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import type { ITaskLinkOption } from "../../../interfaces/task.interface";
import { useProjectQuery, useProjectsQuery } from "../../../hooks/queries/project.query";

interface ITaskProjectPickerProps {
  error: string | null;
  projectId: string | null;
  onChange: (option: ITaskLinkOption | null) => void;
}

const TaskProjectPicker: FC<ITaskProjectPickerProps> = ({ projectId, error, onChange }) => {
  const styles = useStyles();
  const user = useSessionUser();
  const canCreateProject = hasPermission(user, PERMISSIONS.PROJECTS_CREATE);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const selectedQuery = useProjectQuery(projectId);
  const projectsQuery = useProjectsQuery({
    managerId: null,
    projectTypeId: null,
    search: debouncedSearch,
  });

  const options = (projectsQuery.data ?? [])
    .slice(0, TASK_PROJECT_RESULT_LIMIT)
    .map(toProjectLinkOption);
  const emptyAction = canCreateProject ? (
    <Box
      target="_blank"
      component={Link}
      sx={styles.createLink}
      rel="noopener noreferrer"
      to={ROUTE_PATHS.NEW_PROJECT}
    >
      {NEW_TASK_COPY.NEW_PROJECT}
    </Box>
  ) : null;
  const selectedCustomerName = getProjectCustomer(selectedQuery.data)?.name ?? null;

  if (projectId && selectedQuery.data && !selectedQuery.isError) {
    return (
      <TaskLinkSelection
        onReplace={() => onChange(null)}
        replaceLabel={TASK_PROJECT_PICKER_COPY.REPLACE}
        option={toProjectLinkOption(selectedQuery.data)}
        context={
          selectedCustomerName && <TaskProjectCustomerNote customerName={selectedCustomerName} />
        }
      />
    );
  }

  if (projectId) {
    return (
      <TaskLinkSelectionStatus
        isError={selectedQuery.isError}
        onReplace={() => onChange(null)}
        onRetry={() => selectedQuery.refetch()}
      />
    );
  }

  return (
    <TaskLinkPicker
      error={error}
      search={search}
      options={options}
      onSearch={setSearch}
      emptyAction={emptyAction}
      isError={projectsQuery.isError}
      isLoading={projectsQuery.isPending}
      onRetry={() => projectsQuery.refetch()}
      onSelect={optionId => onChange(findLinkOption(options, optionId))}
    />
  );
};

export default TaskProjectPicker;
