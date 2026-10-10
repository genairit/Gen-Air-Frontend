import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import Icon from "../../components/Icon/Icon";
import EmployeesTable from "./components/EmployeesTable";
import { useSessionUser } from "../../store/session.store";
import AddEmployeeCard from "./components/AddEmployeeCard";
import { ICON_NAMES } from "../../constants/icon.constant";
import { hasPermission } from "../../utilities/permission.utility";
import { EMPLOYEES_COPY } from "../../constants/employee.constant";

const EmployeesPage = () => {
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const canManageUsers = hasPermission(sessionUser, "MANAGE_USERS");

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
      {canManageUsers && <AddEmployeeCard />}
      <EmployeesTable canManageUsers={canManageUsers} />
    </Box>
  );
};

export default EmployeesPage;
