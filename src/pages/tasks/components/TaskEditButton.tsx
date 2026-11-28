import {
  BUTTON_SIZES,
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import type { FC } from "react";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { TASK_PAGE_COPY } from "../../../constants/task.constant";
import type { IApiTask } from "../../../interfaces/task.interface";

interface ITaskEditButtonProps {
  task: IApiTask;
  onEdit: (task: IApiTask) => void;
}

const TaskEditButton: FC<ITaskEditButtonProps> = ({ task, onEdit }) => (
  <Button
    icon={ICON_NAMES.EDIT}
    size={BUTTON_SIZES.COMPACT}
    shape={BUTTON_SHAPES.CIRCLE}
    variant={BUTTON_VARIANTS.NEUTRAL}
    ariaLabel={`${TASK_PAGE_COPY.EDIT} · ${task.title}`}
    onClick={event => {
      event.stopPropagation();
      onEdit(task);
    }}
  />
);
export default TaskEditButton;
