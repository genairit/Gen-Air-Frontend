import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import Icon from "../../components/Icon/Icon";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import CustomersTable from "./components/CustomersTable";
import { useSessionUser } from "../../store/session.store";
import { ICON_NAMES } from "../../constants/icon.constant";
import { ROUTE_PATHS } from "../../constants/routes.constant";
import { PERMISSIONS } from "../../constants/permission.constant";
import { hasPermission } from "../../utilities/permission.utility";
import { CUSTOMERS_COPY } from "../../constants/customer.constant";
import { CUSTOMER_FORM_COPY } from "../../constants/customer-form.constant";

const CustomersPage = () => {
  const styles = usePageStyles();
  const navigate = useNavigate();
  const user = useSessionUser();
  const canCreateCustomer = hasPermission(user, PERMISSIONS.CUSTOMERS_CREATE);

  const createCustomerButton = (
    <Button
      icon={ICON_NAMES.ADD}
      text={CUSTOMER_FORM_COPY.ADD}
      onClick={() => navigate(ROUTE_PATHS.NEW_CUSTOMER)}
    />
  );

  const managersOnlyCaption = (
    <Box component="span" sx={styles.caption}>
      {CUSTOMER_FORM_COPY.MANAGERS_ONLY}
    </Box>
  );

  const headerAction = canCreateCustomer ? createCustomerButton : managersOnlyCaption;

  return (
    <Box sx={styles.page}>
      <Box sx={styles.header}>
        <Box sx={styles.headerText}>
          <Box component="span" sx={styles.eyebrow}>
            <Icon size={22} name={ICON_NAMES.CUSTOMER} />
            {CUSTOMERS_COPY.EYEBROW}
          </Box>
          <Box component="h1" sx={styles.heading}>
            {CUSTOMERS_COPY.TITLE}
          </Box>
          <Box component="span" sx={styles.description}>
            {CUSTOMERS_COPY.DESCRIPTION}
          </Box>
        </Box>
        {headerAction}
      </Box>
      <CustomersTable />
    </Box>
  );
};

export default CustomersPage;
