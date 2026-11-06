import { noop } from "../../../utilities/function.utility";
import { createEmployeeColumns } from "../../employees/columns/employee-columns";

export const SHOWCASE_EMPLOYEE_COLUMNS = createEmployeeColumns({
  canEdit: false,
  canDelete: true,
  onEdit: noop,
  onDelete: noop,
});
