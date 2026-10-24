import {
  findLinkOption,
  toCustomerLinkOption,
  toSelectedCustomerOption,
} from "../../../utilities/task.utility";

import {
  NEW_TASK_COPY,
  TASK_LINK_KINDS,
  TASK_LINK_PICKER_COPY,
  TASK_LINK_RESULT_LIMITS,
} from "../../../constants/task.constant";

import { type FC, useState } from "react";
import TaskLinkPicker from "./TaskLinkPicker";
import { useNavigate } from "react-router-dom";
import TaskLinkSelection from "./TaskLinkSelection";
import Button from "../../../components/Button/Button";
import TaskLinkSelectionStatus from "./TaskLinkSelectionStatus";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import type { ITaskLinkOption } from "../../../interfaces/task.interface";
import { isCustomerSelectable } from "../../../utilities/customer.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { useCustomerQuery, useCustomersQuery } from "../../../hooks/queries/customer.query";

interface ITaskCustomerPickerProps {
  error: string | null;
  customerId: string | null;
  onChange: (option: ITaskLinkOption | null) => void;
}

const TaskCustomerPicker: FC<ITaskCustomerPickerProps> = ({ customerId, error, onChange }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const selectedQuery = useCustomerQuery(customerId);
  const customersQuery = useCustomersQuery({ search: debouncedSearch, prioritySyncStatus: null });

  const options = (customersQuery.data ?? [])
    .filter(isCustomerSelectable)
    .slice(0, TASK_LINK_RESULT_LIMITS.customer)
    .map(toCustomerLinkOption);

  if (customerId && selectedQuery.data) {
    return (
      <TaskLinkSelection
        onReplace={() => onChange(null)}
        option={toSelectedCustomerOption(selectedQuery.data)}
        replaceLabel={TASK_LINK_PICKER_COPY.customer.REPLACE}
      />
    );
  }

  if (customerId) {
    return (
      <TaskLinkSelectionStatus
        kind={TASK_LINK_KINDS.CUSTOMER}
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
      kind={TASK_LINK_KINDS.CUSTOMER}
      isError={customersQuery.isError}
      isLoading={customersQuery.isPending}
      onRetry={() => customersQuery.refetch()}
      onSelect={optionId => onChange(findLinkOption(options, optionId))}
      emptyAction={
        <Button
          variant={BUTTON_VARIANTS.NEUTRAL}
          text={NEW_TASK_COPY.NEW_CUSTOMER}
          onClick={() => navigate(ROUTE_PATHS.NEW_CUSTOMER)}
        />
      }
    />
  );
};

export default TaskCustomerPicker;
