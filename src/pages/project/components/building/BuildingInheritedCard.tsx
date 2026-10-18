import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../../page.style";
import Card from "../../../../components/Card/Card";
import Chip from "../../../../components/Chip/Chip";
import { ICON_NAMES } from "../../../../constants/icon.constant";
import { CHIP_VARIANTS } from "../../../../constants/chip.constant";
import CardHeader from "../../../../components/CardHeader/CardHeader";
import DetailTile from "../../../../components/DetailTile/DetailTile";
import { hasTamaNote } from "../../../../utilities/apartment.utility";
import type { IApiProject } from "../../../../interfaces/api.interface";
import { BUILDING_PAGE_COPY } from "../../../../constants/apartment.constant";
import { formatPaymentTerms } from "../../../../utilities/project-intake.utility";
import { PROJECT_CONTACT_COPY } from "../../../../constants/project-contact.constant";
import { formatCustomerDetailValue } from "../../../../utilities/customer-details.utility";

interface IBuildingInheritedCardProps {
  building: IApiProject;
}

const BuildingInheritedCard: FC<IBuildingInheritedCardProps> = ({ building }) => {
  const styles = usePageStyles();

  const verifiedBadge = building.addressPlaceId && (
    <Chip variant={CHIP_VARIANTS.ALERT} label={PROJECT_CONTACT_COPY.VERIFIED_BADGE} />
  );

  const tamaBadge = hasTamaNote(building.notes) && <Chip label={BUILDING_PAGE_COPY.TAMA_BADGE} />;

  return (
    <Card gap="18px">
      <CardHeader
        icon={ICON_NAMES.INFO}
        title={BUILDING_PAGE_COPY.INHERITED_TITLE}
        subtitle={BUILDING_PAGE_COPY.INHERITED_SUBTITLE}
      />
      <Box sx={styles.grid({ minColumnWidth: 220, gap: "14px" })}>
        <DetailTile
          label={BUILDING_PAGE_COPY.PROJECT_TYPE}
          value={formatCustomerDetailValue(building.projectType?.name ?? null)}
        />
        <DetailTile
          badge={verifiedBadge}
          label={BUILDING_PAGE_COPY.ADDRESS}
          value={formatCustomerDetailValue(building.address)}
        />
        <DetailTile
          note={building.paymentTermsNote}
          label={BUILDING_PAGE_COPY.PAYMENT_TERMS}
          value={formatCustomerDetailValue(formatPaymentTerms(building.paymentTerms))}
        />
        <DetailTile
          isFullWidth
          badge={tamaBadge}
          label={BUILDING_PAGE_COPY.PARENT_NOTES}
          value={building.notes ?? BUILDING_PAGE_COPY.NO_NOTES}
        />
      </Box>
    </Card>
  );
};

export default BuildingInheritedCard;
