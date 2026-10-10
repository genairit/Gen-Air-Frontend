import { noop } from "../../../utilities/function.utility";
import { createEmployeeColumns } from "../../employees/columns/employee-columns";

export const SHOWCASE_EMPLOYEE_COLUMNS = createEmployeeColumns({ canManage: true, onDelete: noop });
