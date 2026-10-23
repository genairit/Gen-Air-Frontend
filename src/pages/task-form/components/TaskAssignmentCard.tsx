import {
  NEW_TASK_COPY,
  TASK_ASSIGNEES_QUERY,
  type TaskLinkKindType,
  TASK_LINK_KIND_LABEL_ID,
} from "../../../constants/task.constant";

import {
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

import type {
  TTaskFormErrors,
  ITaskFormValues,
  ITaskLinkOption,
} from "../../../interfaces/task.interface";

import type { FC } from "react";
import { Box } from "@mui/material";
import TaskLinkField from "./TaskLinkField";
import { useStyles } from "./TaskForm.style";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import TaskLinkKindChoice from "./TaskLinkKindChoice";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { useUsersQuery } from "../../../hooks/queries/user.query";
import FieldLabel from "../../../components/FieldLabel/FieldLabel";
import CardHeader from "../../../components/CardHeader/CardHeader";
import NoticeBanner from "../../../components/NoticeBanner/NoticeBanner";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { getAssigneeHint, toAssigneeOptions } from "../../../utilities/task.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface ITaskAssignmentCardProps {
  errors: TTaskFormErrors;
  values: ITaskFormValues;
  onUndoLinkClear: () => void;
  onDismissNotice: () => void;
  clearedNotice: string | null;
  onChange: (changes: Partial<ITaskFormValues>) => void;
  onLinkChange: (option: ITaskLinkOption | null) => void;
  onLinkKindChange: (linkKind: TaskLinkKindType) => void;
}

const TaskAssignmentCard: FC<ITaskAssignmentCardProps> = ({
  errors,
  values,
  onChange,
  onLinkChange,
  clearedNotice,
  onUndoLinkClear,
  onDismissNotice,
  onLinkKindChange,
}) => {
  const styles = useStyles();
  const pageStyles = usePageStyles();
  const usersQuery = useUsersQuery(TASK_ASSIGNEES_QUERY);

  const assigneeOptions = toAssigneeOptions(usersQuery.data ?? []);
  const assigneeHint = errors.assigneeOptionId ?? getAssigneeHint(values.assigneeOptionId);

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
        <Box id={TASK_LINK_KIND_LABEL_ID}>
          <FieldLabel isRequired title={NEW_TASK_COPY.LINK_KIND} />
        </Box>
        <TaskLinkKindChoice
          linkKind={values.linkKind}
          onChange={onLinkKindChange}
          labelId={TASK_LINK_KIND_LABEL_ID}
        />
        {errors.linkKind && (
          <Box component="span" sx={styles.error}>
            {errors.linkKind}
          </Box>
        )}
        {clearedNotice && (
          <NoticeBanner
            lines={[]}
            title={clearedNotice}
            actions={
              <>
                <Button
                  text={NEW_TASK_COPY.UNDO}
                  onClick={onUndoLinkClear}
                  variant={BUTTON_VARIANTS.NEUTRAL}
                />
                <Button
                  onClick={onDismissNotice}
                  text={NEW_TASK_COPY.DISMISS}
                  variant={BUTTON_VARIANTS.NEUTRAL}
                />
              </>
            }
          />
        )}
      </Box>
      <TaskLinkField values={values} errors={errors} onChange={onLinkChange} />
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
    </Card>
  );
};

export default TaskAssignmentCard;
