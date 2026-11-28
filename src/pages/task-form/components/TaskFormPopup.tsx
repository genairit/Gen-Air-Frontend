import type { FC } from "react";
import NewTaskForm from "./NewTaskForm";
import EditTaskForm from "./EditTaskForm";
import type { IApiTask } from "../../../interfaces/task.interface";
import { restoreFocusById } from "../../../utilities/focus.utility";
import type { IApiProject } from "../../../interfaces/api.interface";
import type { TaskType } from "../../../constants/task-type.constant";

export interface ICreateTaskFormProps {
  mode: "create";
  onClose: () => void;
  project: IApiProject;
  initialTaskType: TaskType;
  onCreated: (id: string) => void;
}

export interface IEditTaskFormProps {
  mode: "edit";
  task: IApiTask;
  canEdit: boolean;
  canAssign: boolean;
  onClose: () => void;
  returnFocusId?: string;
}

const TaskFormPopup: FC<ICreateTaskFormProps | IEditTaskFormProps> = props => {
  const close = () => {
    props.onClose();
    if (props.mode === "edit" && props.returnFocusId) {
      const targetId = props.returnFocusId;
      restoreFocusById(targetId);
    }
  };
  return props.mode === "create" ? (
    <NewTaskForm {...props} />
  ) : (
    <EditTaskForm {...props} onClose={close} />
  );
};

export default TaskFormPopup;
