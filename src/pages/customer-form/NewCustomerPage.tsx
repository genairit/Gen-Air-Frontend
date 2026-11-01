import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import NewCustomerForm from "./components/NewCustomerForm";
import { useSessionUser } from "../../store/session.store";
import { ICON_NAMES } from "../../constants/icon.constant";
import { ROUTE_PATHS } from "../../constants/routes.constant";
import EmptyState from "../../components/EmptyState/EmptyState";
import { PERMISSIONS } from "../../constants/permission.constant";
import { getFullName } from "../../utilities/mappers/user.mapper";
import { hasPermission } from "../../utilities/permission.utility";
import { CUSTOMER_FORM_COPY } from "../../constants/customer-form.constant";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";

const NewCustomerPage = () => {
  const styles = usePageStyles();
  const navigate = useNavigate();
  const user = useSessionUser();

  if (!user || !hasPermission(user, PERMISSIONS.CUSTOMERS_CREATE)) {
    return (
      <EmptyState
        icon={ICON_NAMES.CUSTOMER}
        title={CUSTOMER_FORM_COPY.DENIED_TITLE}
        description={CUSTOMER_FORM_COPY.DENIED_DESCRIPTION}
        action={
          <Button
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={CUSTOMER_FORM_COPY.BACK_TO_CUSTOMERS}
            onClick={() => navigate(ROUTE_PATHS.CUSTOMERS)}
          />
        }
      />
    );
  }

  return (
    <Box sx={styles.page}>
      <Box sx={styles.headerText}>
        <Box component="span" sx={styles.eyebrow}>
          {CUSTOMER_FORM_COPY.EYEBROW}
        </Box>
        <Box component="h1" sx={styles.heading}>
          {CUSTOMER_FORM_COPY.TITLE}
        </Box>
        <Box component="span" sx={styles.description}>
          {CUSTOMER_FORM_COPY.DESCRIPTION}
        </Box>
      </Box>
      <NewCustomerForm creatorName={getFullName(user)} />
    </Box>
  );
};

export default NewCustomerPage;
