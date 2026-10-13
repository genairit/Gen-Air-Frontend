import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import Icon from "../../components/Icon/Icon";
import CustomersTable from "./components/CustomersTable";
import { ICON_NAMES } from "../../constants/icon.constant";
import { CUSTOMERS_COPY } from "../../constants/customer.constant";

const CustomersPage = () => {
  const styles = usePageStyles();

  return (
    <Box sx={styles.page}>
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
      <CustomersTable />
    </Box>
  );
};

export default CustomersPage;
