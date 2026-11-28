import EmployeesTable from "./components/EmployeesTable";
import { useSessionUser } from "../../store/session.store";
import { PERMISSIONS } from "../../constants/permission.constant";
import { hasPermission } from "../../utilities/permission.utility";

const EmployeesPage = () => {
  const sessionUser = useSessionUser();
  const canCreate =
    hasPermission(sessionUser, PERMISSIONS.EMPLOYEES_CREATE) &&
    hasPermission(sessionUser, PERMISSIONS.EMPLOYEES_ROLES_ASSIGN);
  const canDelete = hasPermission(sessionUser, PERMISSIONS.EMPLOYEES_DELETE);
  const canEditRoles =
    hasPermission(sessionUser, PERMISSIONS.EMPLOYEES_UPDATE) &&
    hasPermission(sessionUser, PERMISSIONS.EMPLOYEES_ROLES_ASSIGN);

  return (
    <EmployeesTable canCreate={canCreate} canDeleteUsers={canDelete} canEditRoles={canEditRoles} />
  );
};

export default EmployeesPage;
