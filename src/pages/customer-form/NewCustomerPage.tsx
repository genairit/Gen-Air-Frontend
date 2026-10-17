import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import NewCustomerForm from "./components/NewCustomerForm";
import { useSessionUser } from "../../store/session.store";
import { ICON_NAMES } from "../../constants/icon.constant";
import EmptyState from "../../components/EmptyState/EmptyState";
import { hasPermission } from "../../utilities/permission.utility";
import { CUSTOMER_FORM_COPY } from "../../constants/customer-form.constant";

const NewCustomerPage = () => {
  const styles = usePageStyles();
  const user = useSessionUser();
  if (!hasPermission(user, "MANAGE_CUSTOMERS")) {
    return (
      <EmptyState description="" icon={ICON_NAMES.CUSTOMER} title={CUSTOMER_FORM_COPY.DENIED} />
    );
  }

  return (
    <Box sx={styles.page}>
      <Box sx={styles.headerText}>
        <Box component="h1" sx={styles.heading}>
          {CUSTOMER_FORM_COPY.TITLE}
        </Box>
        <Box component="span" sx={styles.description}>
          {CUSTOMER_FORM_COPY.DESCRIPTION}
        </Box>
      </Box>
      <NewCustomerForm />
    </Box>
  );
};
export default NewCustomerPage;
