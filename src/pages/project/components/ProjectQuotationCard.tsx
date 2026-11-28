import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import { useStyles } from "./ProjectQuotationCard.style";
import badgeStyles from "../../quotations/quotation.module.css";
import { SURFACE_DEPTHS } from "../../../constants/surface.constant";
import { formatRelativeTime } from "../../../utilities/date.utility";
import ProjectQuotationRowDetails from "./ProjectQuotationRowDetails";
import { quotationMoney } from "../../../utilities/quotation.utility";
import type { IProjectQuotation } from "../../../interfaces/quotation.interface";
import { PROJECT_QUOTATIONS_COPY } from "../../../constants/quotation-sharing.constant";
import { quotationNeedsCorrection } from "../../../utilities/quotation-rejection.utility";
import { QUOTATION_ROW_COPY, QUOTATION_STATUS_LABELS } from "../../../constants/quotation.constant";

interface IProjectQuotationCardProps {
  onOpen: () => void;
  quotation: IProjectQuotation;
}

const ProjectQuotationCard = ({ quotation, onOpen }: IProjectQuotationCardProps) => {
  const styles = useStyles();
  const customer = quotation.customerName ?? QUOTATION_ROW_COPY.CUSTOMER;
  const needsCorrection = quotationNeedsCorrection(quotation);
  const status = needsCorrection ? "נדרש תיקון" : QUOTATION_STATUS_LABELS[quotation.status];

  return (
    <Card
      onClick={onOpen}
      sx={styles.card}
      depth={SURFACE_DEPTHS.FLAT}
      ariaLabel={`${quotation.number} · ${customer} · ${status}`}
    >
      <Box sx={styles.header}>
        <Box sx={styles.identity}>
          <Box component="bdi" sx={styles.number}>
            {quotation.number}
          </Box>
          <Box component="bdi" sx={styles.customer}>
            {customer}
          </Box>
        </Box>
        <Box
          component="span"
          className={badgeStyles.badge}
          data-status={quotation.status}
          data-needs-correction={needsCorrection}
        >
          {status}
        </Box>
      </Box>
      <ProjectQuotationRowDetails quotation={quotation} />
      <Box sx={styles.footer}>
        <Box component="bdi" sx={styles.amount}>
          {quotationMoney(quotation.totals.total)}
        </Box>
        <Box component="time" sx={styles.updated} dateTime={quotation.updatedAt}>
          {PROJECT_QUOTATIONS_COPY.UPDATED} {formatRelativeTime(quotation.updatedAt)}
        </Box>
      </Box>
    </Card>
  );
};
export default ProjectQuotationCard;
