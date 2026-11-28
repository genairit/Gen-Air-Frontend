import {
  getTaskLinkKind,
  getTaskLinkName,
  buildTaskLinkPath,
  formatTaskDueFull,
  getTaskProjectCustomer,
  formatTaskLinkedToLabel,
} from "../../../utilities/task.utility";

import {
  TASK_PAGE_COPY,
  TASK_LINK_KIND_LABELS,
  TASK_LINK_CHIP_VARIANTS,
} from "../../../constants/task.constant";

import {
  TASK_TYPES,
  TASK_TYPE_LABELS,
  PROJECT_TASK_COPY,
} from "../../../constants/task-type.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import TaskFieldTile from "./TaskFieldTile";
import { useStyles } from "./TaskPanels.style";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import TaskAssigneeField from "./TaskAssigneeField";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { CHIP_SIZES } from "../../../constants/chip.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import type { IApiTask } from "../../../interfaces/task.interface";
import { buildCustomerPath } from "../../../utilities/route.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface ITaskDetailsCardProps {
  task: IApiTask;
  canEdit: boolean;
  canClaim: boolean;
  canAssign: boolean;
  onEdit: () => void;
  onClaim: () => void;
}

const TaskDetailsCard: FC<ITaskDetailsCardProps> = ({
  task,
  onClaim,
  canClaim,
  onEdit,
  canEdit,
  canAssign,
}) => {
  const styles = useStyles();
  const pageStyles = usePageStyles();

  const isLocked = !canEdit;
  const isAssignmentLocked = !canAssign;
  const linkKind = getTaskLinkKind(task);
  const linkPath = buildTaskLinkPath(task);
  const projectCustomer = getTaskProjectCustomer(task);
  const isProtected = task.taskType !== TASK_TYPES.GENERAL;
  return (
    <Card gap="18px">
      <CardHeader
        icon={ICON_NAMES.INFO}
        title={TASK_PAGE_COPY.DETAILS_TITLE}
        subtitle={TASK_PAGE_COPY.DETAILS_SUBTITLE}
        action={
          canEdit && (
            <Button
              text={TASK_PAGE_COPY.EDIT}
              icon={ICON_NAMES.EDIT}
              onClick={onEdit}
              variant={BUTTON_VARIANTS.NEUTRAL}
            />
          )
        }
      />
      <Box sx={pageStyles.grid({ minColumnWidth: 220, gap: "14px" })}>
        <TaskFieldTile label={formatTaskLinkedToLabel(task)}>
          <Box sx={styles.linkRow}>
            <Chip
              size={CHIP_SIZES.SMALL}
              label={TASK_LINK_KIND_LABELS[linkKind]}
              variant={TASK_LINK_CHIP_VARIANTS[linkKind]}
            />
            {linkPath && (
              <Box to={linkPath} component={Link} sx={styles.link}>
                {getTaskLinkName(task)}
              </Box>
            )}
          </Box>
        </TaskFieldTile>
        {projectCustomer && (
          <TaskFieldTile label={TASK_PAGE_COPY.PROJECT_CUSTOMER}>
            <Box component={Link} sx={styles.link} to={buildCustomerPath(projectCustomer.id)}>
              {projectCustomer.name}
            </Box>
          </TaskFieldTile>
        )}
        <TaskFieldTile label={PROJECT_TASK_COPY.TYPE}>
          <Box component="b" sx={styles.value}>
            {TASK_TYPE_LABELS[task.taskType]}
          </Box>
          {isProtected && (
            <Box component="span" sx={pageStyles.caption}>
              {PROJECT_TASK_COPY.PROTECTED_HELP}
            </Box>
          )}
        </TaskFieldTile>
        <TaskFieldTile isLocked={isAssignmentLocked} label={TASK_PAGE_COPY.ASSIGNEE}>
          <TaskAssigneeField task={task} onClaim={onClaim} canClaim={canClaim} />
        </TaskFieldTile>
        <TaskFieldTile isLocked={isLocked} label={TASK_PAGE_COPY.DUE_DATE}>
          <Box component="b" sx={styles.value}>
            {formatTaskDueFull(task)}
          </Box>
        </TaskFieldTile>
      </Box>
      <TaskFieldTile isLocked={isLocked} label={TASK_PAGE_COPY.DESCRIPTION}>
        <Box component="span" sx={styles.value}>
          {task.description}
        </Box>
      </TaskFieldTile>
    </Card>
  );
};

export default TaskDetailsCard;
