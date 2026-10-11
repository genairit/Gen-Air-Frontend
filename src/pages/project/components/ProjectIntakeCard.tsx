import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { CHIP_VARIANTS } from "../../../constants/chip.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import DetailTile from "../../../components/DetailTile/DetailTile";
import type { IApiProject } from "../../../interfaces/api.interface";
import { formatPaymentTerms } from "../../../utilities/project-intake.utility";
import { PAYMENT_TERMS_COPY } from "../../../constants/payment-terms.constant";
import { PROJECT_CONTACT_COPY } from "../../../constants/project-contact.constant";
import { PROJECT_ADDRESS_COPY } from "../../../constants/project-address.constant";
import { formatCustomerDetailValue } from "../../../utilities/customer-details.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface IProjectIntakeCardProps {
  project: IApiProject;
  onEdit: (() => void) | null;
}

const ProjectIntakeCard: FC<IProjectIntakeCardProps> = ({ project, onEdit }) => {
  const pageStyles = usePageStyles();

  const verifiedBadge = project.addressPlaceId && (
    <Chip variant={CHIP_VARIANTS.ALERT} label={PROJECT_CONTACT_COPY.VERIFIED_BADGE} />
  );

  const editAction = onEdit && (
    <Button onClick={onEdit} text={PROJECT_CONTACT_COPY.EDIT} variant={BUTTON_VARIANTS.NEUTRAL} />
  );

  return (
    <Card gap="18px" padding="24px">
      <CardHeader
        action={editAction}
        icon={ICON_NAMES.LOCATION}
        title={PROJECT_CONTACT_COPY.VIEW_TITLE}
      />
      <Box sx={pageStyles.grid({ minColumnWidth: 200, gap: "14px" })}>
        <DetailTile
          isFullWidth
          badge={verifiedBadge}
          label={PROJECT_ADDRESS_COPY.LABEL}
          value={formatCustomerDetailValue(project.address)}
        />
        <DetailTile
          label={PROJECT_CONTACT_COPY.CONTACT_LABEL}
          value={formatCustomerDetailValue(project.contactName)}
        />
        <DetailTile
          isLtr
          label={PROJECT_CONTACT_COPY.PHONE_LABEL}
          value={formatCustomerDetailValue(project.contactPhone)}
        />
        <DetailTile
          label={PROJECT_CONTACT_COPY.ROLE_LABEL}
          value={formatCustomerDetailValue(project.contactRole)}
        />
        <DetailTile
          isFullWidth
          note={project.paymentTermsNote}
          label={PAYMENT_TERMS_COPY.TITLE}
          value={formatCustomerDetailValue(formatPaymentTerms(project.paymentTerms))}
        />
      </Box>
    </Card>
  );
};

export default ProjectIntakeCard;
