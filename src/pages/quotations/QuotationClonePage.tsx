import { Box } from "@mui/material";
import styles from "./quotation.module.css";
import { useSessionUser } from "../../store/session.store";
import QuotationCloneForm from "./components/QuotationCloneForm";
import { buildQuotationPath } from "../../utilities/route.utility";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const QuotationClonePage = () => {
  const { quotationId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSessionUser();
  const key = `${location.key}:${quotationId}:${user?.id}:${user?.role}:${user?.permissions.join(",")}`;
  return (
    <Box component="main" className={styles.page}>
      <QuotationCloneForm
        key={key}
        sourceId={quotationId}
        onCancel={() => navigate(buildQuotationPath(quotationId), { state: location.state })}
      />
    </Box>
  );
};

export default QuotationClonePage;
