import {
  isHistoryPartial,
  getVisibleHistory,
  formatHistoryCount,
  getHistoryToggleCopy,
  formatTransitionTime,
  formatTransitionAuthor,
} from "../../../utilities/task.utility";

import {
  TASK_HISTORY_COPY,
  TASK_STATUS_LABELS,
  TASK_STATUS_DOT_COLORS,
  TASK_HISTORY_PREVIEW_COUNT,
} from "../../../constants/task.constant";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { useStyles } from "./TaskHistory.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import TaskTransitionBadge from "./TaskTransitionBadge";
import Timeline from "../../../components/Timeline/Timeline";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useTaskTransitionsQuery } from "../../../hooks/queries/task.query";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface ITaskHistoryCardProps {
  taskId: string;
}

const TaskHistoryCard: FC<ITaskHistoryCardProps> = ({ taskId }) => {
  const styles = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  const transitionsQuery = useTaskTransitionsQuery(taskId);

  const transitions = transitionsQuery.data ?? [];
  const canToggle = transitions.length > TASK_HISTORY_PREVIEW_COUNT;
  const isEmpty = transitionsQuery.isSuccess && transitions.length === 0;
  const toggle = getHistoryToggleCopy({ isExpanded, total: transitions.length });

  const entries = getVisibleHistory(transitions, isExpanded).map(transition => ({
    id: transition.id,
    label: TASK_STATUS_LABELS[transition.toStatus],
    date: formatTransitionTime(transition),
    author: formatTransitionAuthor(transition),
    dotColor: TASK_STATUS_DOT_COLORS[transition.toStatus],
    badge: <TaskTransitionBadge transition={transition} />,
  }));

  return (
    <Card gap="18px">
      <CardHeader
        icon={ICON_NAMES.PROGRESS}
        title={TASK_HISTORY_COPY.TITLE}
        badge={formatHistoryCount(transitions.length)}
        action={
          <Box component="span" sx={styles.caption}>
            {TASK_HISTORY_COPY.SUBTITLE}
          </Box>
        }
      />
      {transitionsQuery.isPending && <LoadingState label={TASK_HISTORY_COPY.LOADING} />}
      {transitionsQuery.isError && (
        <InlineError message={getApiErrorMessage(transitionsQuery.error)} />
      )}
      {isEmpty && (
        <Box sx={styles.empty}>
          <Box component="b" sx={styles.emptyTitle}>
            {TASK_HISTORY_COPY.EMPTY_TITLE}
          </Box>
          <Box component="span" sx={styles.caption}>
            {TASK_HISTORY_COPY.EMPTY_DESCRIPTION}
          </Box>
        </Box>
      )}
      <Timeline entries={entries} />
      {isHistoryPartial(transitions) && (
        <Box component="span" sx={styles.caption}>
          {TASK_HISTORY_COPY.PARTIAL_NOTE}
        </Box>
      )}
      {canToggle && (
        <Box sx={styles.footer}>
          <Box component="span" sx={styles.caption}>
            {toggle.caption}
          </Box>
          <Button
            text={toggle.label}
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={() => setIsExpanded(current => !current)}
          />
        </Box>
      )}
    </Card>
  );
};

export default TaskHistoryCard;
