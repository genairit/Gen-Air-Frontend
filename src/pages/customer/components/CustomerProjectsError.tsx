import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./CustomerProjects.style";
import Button from "../../../components/Button/Button";
import { CUSTOMER_PROJECT_COPY } from "../../../constants/customer-project.constant";

interface ICustomerProjectsErrorProps {
  onRetry: () => Promise<void>;
}

const CustomerProjectsError: FC<ICustomerProjectsErrorProps> = ({ onRetry }) => {
  const styles = useStyles();
  return (
    <Box role="alert" sx={styles.error}>
      <Box>
        <Box component="b">{CUSTOMER_PROJECT_COPY.ERROR}</Box>
        <Box sx={styles.caption}>{CUSTOMER_PROJECT_COPY.ERROR_DESCRIPTION}</Box>
      </Box>
      <Button onClick={onRetry} text={CUSTOMER_PROJECT_COPY.RETRY} />
    </Box>
  );
};
export default CustomerProjectsError;
