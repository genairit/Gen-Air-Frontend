import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import Icon from "../../components/Icon/Icon";
import EmployeesTable from "./components/EmployeesTable";
import { useSessionUser } from "../../store/session.store";
import AddEmployeeCard from "./components/AddEmployeeCard";
import { ICON_NAMES } from "../../constants/icon.constant";
import { PERMISSIONS } from "../../constants/permission.constant";
import { hasPermission } from "../../utilities/permission.utility";
import { EMPLOYEES_COPY } from "../../constants/employee.constant";

const EmployeesPage = () => {
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const canCreate =
    hasPermission(sessionUser, PERMISSIONS.EMPLOYEES_CREATE) &&
    hasPermission(sessionUser, PERMISSIONS.EMPLOYEES_ROLES_ASSIGN);
  const canDelete = hasPermission(sessionUser, PERMISSIONS.EMPLOYEES_DELETE);

  return (
    <Box sx={styles.page}>
      <Box sx={styles.headerText}>
        <Box component="span" sx={styles.eyebrow}>
          <Icon size={22} name={ICON_NAMES.FOREMAN} />
          {EMPLOYEES_COPY.EYEBROW}
        </Box>
        <Box component="h1" sx={styles.heading}>
          {EMPLOYEES_COPY.TITLE}
        </Box>
        <Box component="span" sx={styles.description}>
          {EMPLOYEES_COPY.DESCRIPTION}
        </Box>
      </Box>
      {canCreate && <AddEmployeeCard />}
      <EmployeesTable canManageUsers={canDelete} />
    </Box>
  );
};

export default EmployeesPage;
