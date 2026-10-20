import TaskDueCell from "./cells/TaskDueCell";
import TaskTitleCell from "./cells/TaskTitleCell";
import TaskStatusCell from "./cells/TaskStatusCell";
import TaskAssigneeCell from "./cells/TaskAssigneeCell";
import { canClaimTask } from "../../../utilities/task.utility";
import type { IApiTask } from "../../../interfaces/task.interface";
import TaskUrgentChip from "../../../components/TaskUrgentChip/TaskUrgentChip";
import type { IDataTableColumn } from "../../../interfaces/data-table.interface";
import { TASK_TABLE_HEADERS, type TaskStatusType } from "../../../constants/task.constant";

export const TASK_TABLE_MIN_WIDTH = 860;

interface ITaskColumnsOptions {
  canClaim: boolean;
  canChangeStatus: boolean;
  onClaim: (task: IApiTask) => void;
  onStatusChange: (task: IApiTask, status: TaskStatusType) => void;
}

export const buildTaskColumns = ({
  onClaim,
  canClaim,
  onStatusChange,
  canChangeStatus,
}: ITaskColumnsOptions): IDataTableColumn<IApiTask>[] => [
  {
    id: "task",
    track: "minmax(240px, 2fr)",
    header: TASK_TABLE_HEADERS.TASK,
    render: task => <TaskTitleCell task={task} />,
  },
  {
    id: "status",
    track: "minmax(170px, 1fr)",
    header: TASK_TABLE_HEADERS.STATUS,
    render: task => (
      <TaskStatusCell task={task} onChange={onStatusChange} canChange={canChangeStatus} />
    ),
  },
  {
    id: "assignee",
    track: "minmax(180px, 1.2fr)",
    header: TASK_TABLE_HEADERS.ASSIGNEE,
    render: task => (
      <TaskAssigneeCell task={task} onClaim={onClaim} canClaim={canClaimTask(task, canClaim)} />
    ),
  },
  {
    id: "due",
    track: "minmax(100px, 0.6fr)",
    header: TASK_TABLE_HEADERS.DUE,
    render: task => <TaskDueCell task={task} />,
  },
  {
    id: "urgency",
    track: "minmax(90px, 0.5fr)",
    header: TASK_TABLE_HEADERS.URGENCY,
    render: task => task.isUrgent && <TaskUrgentChip />,
  },
];
