import {
  getCustomerHint,
  getAssigneeHint,
  toAssigneeOptions,
} from "../../../utilities/task.utility";

import {
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./TaskForm.style";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import TaskProjectPicker from "./TaskProjectPicker";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { useUsersQuery } from "../../../hooks/queries/user.query";
import FieldLabel from "../../../components/FieldLabel/FieldLabel";
import CardHeader from "../../../components/CardHeader/CardHeader";
import type { IApiProject } from "../../../interfaces/api.interface";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { useCustomersQuery } from "../../../hooks/queries/customer.query";
import { isCustomerSelectable } from "../../../utilities/customer.utility";
import { ALL_CUSTOMERS_QUERY } from "../../../constants/customer.constant";
import { NEW_TASK_COPY, TASK_ASSIGNEES_QUERY } from "../../../constants/task.constant";
import type { TTaskFormErrors, ITaskFormValues } from "../../../interfaces/task.interface";

interface ITaskAssignmentCardProps {
  errors: TTaskFormErrors;
  values: ITaskFormValues;
  onChange: (changes: Partial<ITaskFormValues>) => void;
  onProjectChange: (project: IApiProject | null) => void;
}

const TaskAssignmentCard: FC<ITaskAssignmentCardProps> = ({
  errors,
  values,
  onChange,
  onProjectChange,
}) => {
  const styles = useStyles();
  const pageStyles = usePageStyles();
  const usersQuery = useUsersQuery(TASK_ASSIGNEES_QUERY);
  const customersQuery = useCustomersQuery(ALL_CUSTOMERS_QUERY);

  const assigneeOptions = toAssigneeOptions(usersQuery.data ?? []);
  const customerOptions = (customersQuery.data ?? [])
    .filter(isCustomerSelectable)
    .map(customer => ({ id: customer.id, label: customer.name }));
  const customerHint = errors.customerId ?? getCustomerHint(values.isCustomerFromProject);
  const assigneeHint = errors.assigneeOptionId ?? getAssigneeHint(values.assigneeOptionId);

  const changeCustomer = (label: string | null) =>
    onChange({
      isCustomerFromProject: false,
      customerId: findOptionIdByLabel(customerOptions, label),
    });

  const changeAssignee = (label: string | null) =>
    onChange({ assigneeOptionId: findOptionIdByLabel(assigneeOptions, label) });

  return (
    <Card gap="20px" padding="28px">
      <CardHeader
        icon={ICON_NAMES.BUILDING}
        title={NEW_TASK_COPY.ASSIGNMENT_TITLE}
        subtitle={NEW_TASK_COPY.ASSIGNMENT_SUBTITLE}
      />
      <Box sx={pageStyles.stack({ gap: "10px" })}>
        <FieldLabel isRequired title={NEW_TASK_COPY.PROJECT} />
        <TaskProjectPicker
          onChange={onProjectChange}
          projectId={values.projectId}
          error={errors.projectId ?? null}
        />
      </Box>
      <Box sx={pageStyles.grid({ minColumnWidth: 240, gap: "16px" })}>
        <Box sx={pageStyles.stack({ gap: "6px" })}>
          <Autocomplete
            isRequired
            isAutocomplete={false}
            onChange={changeCustomer}
            title={NEW_TASK_COPY.CUSTOMER}
            options={getOptionLabels(customerOptions)}
            placeholder={NEW_TASK_COPY.CHOOSE_CUSTOMER}
            value={findOptionLabelById(customerOptions, values.customerId)}
          />
          {customerHint && (
            <Box component="span" sx={errors.customerId ? styles.error : styles.hint}>
              {customerHint}
            </Box>
          )}
        </Box>
        <Box sx={pageStyles.stack({ gap: "6px" })}>
          <Autocomplete
            isRequired
            isAutocomplete={false}
            onChange={changeAssignee}
            title={NEW_TASK_COPY.ASSIGNEE}
            options={getOptionLabels(assigneeOptions)}
            placeholder={NEW_TASK_COPY.CHOOSE_ASSIGNEE}
            value={findOptionLabelById(assigneeOptions, values.assigneeOptionId)}
          />
          {assigneeHint && (
            <Box component="span" sx={errors.assigneeOptionId ? styles.error : styles.hint}>
              {assigneeHint}
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default TaskAssignmentCard;
