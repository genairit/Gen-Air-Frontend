import { useState } from "react";
import TasksTable from "./components/TasksTable";
import { useSessionUser } from "../../store/session.store";
import type { IApiTask } from "../../interfaces/task.interface";
import { PERMISSIONS } from "../../constants/permission.constant";
import TaskFormPopup from "../task-form/components/TaskFormPopup";
import { getTaskEditButtonId } from "../../utilities/task.utility";
import { hasPermission } from "../../utilities/permission.utility";

const TasksPage = () => {
  const sessionUser = useSessionUser();
  const [editingTask, setEditingTask] = useState<IApiTask | null>(null);
  const canEdit = hasPermission(sessionUser, PERMISSIONS.TASKS_UPDATE);
  const canClaim = hasPermission(sessionUser, PERMISSIONS.TASKS_CLAIM);
  const canAssign = hasPermission(sessionUser, PERMISSIONS.TASKS_ASSIGN);

  return (
    <>
      <TasksTable canClaim={canClaim} onEdit={canEdit ? setEditingTask : null} />
      {canEdit && editingTask && (
        <TaskFormPopup
          mode="edit"
          canEdit={canEdit}
          task={editingTask}
          canAssign={canAssign}
          onClose={() => setEditingTask(null)}
          returnFocusId={getTaskEditButtonId(editingTask.id)}
        />
      )}
    </>
  );
};

export default TasksPage;
