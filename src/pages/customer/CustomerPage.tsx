import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import Button from "../../components/Button/Button";
import { useNavigate, useParams } from "react-router-dom";
import { ICON_NAMES } from "../../constants/icon.constant";
import CustomerSyncCard from "./components/CustomerSyncCard";
import EmptyState from "../../components/EmptyState/EmptyState";
import CustomerHeaderCard from "./components/CustomerHeaderCard";
import CustomerDetailsCard from "./components/CustomerDetailsCard";
import LoadingState from "../../components/LoadingState/LoadingState";
import { useCustomerQuery } from "../../hooks/queries/customer.query";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { CUSTOMER_PAGE_COPY } from "../../constants/customer.constant";
import { NAVIGATION_LABELS } from "../../constants/navigation.constant";
import { ROUTE_PARAMS, ROUTE_PATHS } from "../../constants/routes.constant";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";

const CustomerPage = () => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const params = useParams();
  const customerId = params[ROUTE_PARAMS.CUSTOMER_ID] ?? null;
  const customerQuery = useCustomerQuery(customerId);

  if (customerQuery.isPending) {
    return <LoadingState label={CUSTOMER_PAGE_COPY.LOADING} />;
  }

  if (customerQuery.isError) {
    return (
      <EmptyState
        icon={ICON_NAMES.CUSTOMER}
        title={CUSTOMER_PAGE_COPY.NOT_FOUND_TITLE}
        description={getApiErrorMessage(customerQuery.error)}
        action={
          <Button
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={NAVIGATION_LABELS.BACK_TO_CUSTOMERS}
            onClick={() => navigate(ROUTE_PATHS.CUSTOMERS)}
          />
        }
      />
    );
  }

  const customer = customerQuery.data;

  return (
    <Box sx={styles.page}>
      <CustomerHeaderCard customer={customer} />
      <CustomerSyncCard customer={customer} />
      <CustomerDetailsCard customer={customer} />
    </Box>
  );
};

export default CustomerPage;
