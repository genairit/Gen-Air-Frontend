import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import PaymentTermsTile from "./PaymentTermsTile";
import InheritedValueTile from "./InheritedValueTile";
import { useStyles } from "./InheritedValueTile.style";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { CHIP_VARIANTS } from "../../../constants/chip.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import type { IApiProject } from "../../../interfaces/api.interface";
import { formatApartmentUnit } from "../../../utilities/apartment.utility";
import { PROJECT_INTAKE_COPY } from "../../../constants/project-intake.constant";
import { formatCustomerDetailValue } from "../../../utilities/customer-details.utility";
import { APARTMENT_PAGE_COPY, INHERITANCE_BADGES } from "../../../constants/apartment.constant";

interface IApartmentInheritedCardProps {
  canEdit: boolean;
  building: IApiProject;
  apartment: IApiProject;
}

const ApartmentInheritedCard: FC<IApartmentInheritedCardProps> = ({
  canEdit,
  building,
  apartment,
}) => {
  const styles = useStyles();
  const pageStyles = usePageStyles();

  const verifiedBadge = apartment.addressPlaceId && (
    <Chip variant={CHIP_VARIANTS.ALERT} label={PROJECT_INTAKE_COPY.VERIFIED_BADGE} />
  );

  return (
    <Card gap="18px">
      <CardHeader
        icon={ICON_NAMES.INFO}
        title={APARTMENT_PAGE_COPY.INHERITED_TITLE}
        subtitle={APARTMENT_PAGE_COPY.INHERITED_SUBTITLE}
      />
      <Box sx={styles.legend}>
        {Object.values(INHERITANCE_BADGES).map(badge => (
          <Box component="span" key={badge.label} sx={styles.legendItem}>
            <Chip label={badge.label} variant={badge.variant} />
            {badge.description}
          </Box>
        ))}
      </Box>
      <Box sx={pageStyles.stack({ gap: "14px" })}>
        <InheritedValueTile
          source="building"
          label={APARTMENT_PAGE_COPY.PROJECT_TYPE}
          notes={[APARTMENT_PAGE_COPY.LOCKED_TYPE]}
          value={formatCustomerDetailValue(apartment.projectType?.name ?? null)}
        />
        <InheritedValueTile
          source="building"
          badge={verifiedBadge}
          label={APARTMENT_PAGE_COPY.ADDRESS}
          notes={[APARTMENT_PAGE_COPY.LOCKED_ADDRESS]}
          value={formatCustomerDetailValue(apartment.address)}
        />
        <InheritedValueTile
          source="own"
          label={APARTMENT_PAGE_COPY.UNIT}
          value={formatApartmentUnit(apartment)}
          notes={[APARTMENT_PAGE_COPY.UNIT_SUB, APARTMENT_PAGE_COPY.EDITABLE_HERE]}
        />
        <PaymentTermsTile canEdit={canEdit} building={building} apartment={apartment} />
      </Box>
    </Card>
  );
};

export default ApartmentInheritedCard;
