import {
  findLinkOption,
  getProjectCustomer,
  toProjectLinkOption,
} from "../../../utilities/task.utility";

import {
  TASK_LINK_KINDS,
  TASK_LINK_PICKER_COPY,
  TASK_LINK_RESULT_LIMITS,
} from "../../../constants/task.constant";

import { type FC, useState } from "react";
import TaskLinkPicker from "./TaskLinkPicker";
import TaskLinkSelection from "./TaskLinkSelection";
import TaskProjectCustomerNote from "./TaskProjectCustomerNote";
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
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const selectedQuery = useProjectQuery(projectId);
  const projectsQuery = useProjectsQuery({
    managerId: null,
    projectTypeId: null,
    search: debouncedSearch,
  });

  const options = (projectsQuery.data ?? [])
    .slice(0, TASK_LINK_RESULT_LIMITS.project)
    .map(toProjectLinkOption);
  const selectedCustomerName = getProjectCustomer(selectedQuery.data)?.name ?? null;

  if (projectId && selectedQuery.data) {
    return (
      <TaskLinkSelection
        onReplace={() => onChange(null)}
        option={toProjectLinkOption(selectedQuery.data)}
        replaceLabel={TASK_LINK_PICKER_COPY.project.REPLACE}
        context={
          selectedCustomerName && <TaskProjectCustomerNote customerName={selectedCustomerName} />
        }
      />
    );
  }

  return (
    <TaskLinkPicker
      error={error}
      search={search}
      options={options}
      onSearch={setSearch}
      kind={TASK_LINK_KINDS.PROJECT}
      isError={projectsQuery.isError}
      isLoading={projectsQuery.isPending}
      onRetry={() => projectsQuery.refetch()}
      onSelect={optionId => onChange(findLinkOption(options, optionId))}
    />
  );
};

export default TaskProjectPicker;
