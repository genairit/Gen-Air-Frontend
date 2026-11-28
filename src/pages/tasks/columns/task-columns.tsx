import TaskDueCell from "./cells/TaskDueCell";
import TaskTitleCell from "./cells/TaskTitleCell";
import TaskAssigneeCell from "./cells/TaskAssigneeCell";
import TaskEditButton from "../components/TaskEditButton";
import { canClaimTask } from "../../../utilities/task.utility";
import type { IApiTask } from "../../../interfaces/task.interface";
import { TASK_TABLE_HEADERS } from "../../../constants/task.constant";
import TaskUrgentChip from "../../../components/TaskUrgentChip/TaskUrgentChip";
import type { IDataTableColumn } from "../../../interfaces/data-table.interface";

export const TASK_TABLE_MIN_WIDTH = 700;

interface ITaskColumnsOptions {
  canClaim: boolean;
  onClaim: (task: IApiTask) => void;
  onEdit: ((task: IApiTask) => void) | null;
}

export const buildTaskColumns = ({
  onEdit,
  onClaim,
  canClaim,
}: ITaskColumnsOptions): IDataTableColumn<IApiTask>[] => [
  {
    id: "task",
    track: "minmax(240px, 2fr)",
    header: TASK_TABLE_HEADERS.TASK,
    render: task => <TaskTitleCell task={task} />,
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
  ...(onEdit
    ? [
        {
          id: "edit",
          track: "48px",
          header: "",
          render: (task: IApiTask) => <TaskEditButton task={task} onEdit={onEdit} />,
        },
      ]
    : []),
];
