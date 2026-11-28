import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import InheritedValueTile from "./InheritedValueTile";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { CHIP_VARIANTS } from "../../../constants/chip.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import type { IApiProject } from "../../../interfaces/api.interface";
import { formatApartmentUnit } from "../../../utilities/apartment.utility";
import { APARTMENT_PAGE_COPY } from "../../../constants/apartment.constant";
import { PROJECT_INTAKE_COPY } from "../../../constants/project-intake.constant";
import { formatCustomerDetailValue } from "../../../utilities/customer-details.utility";

interface IApartmentInheritedCardProps {
  apartment: IApiProject;
}

const ApartmentInheritedCard: FC<IApartmentInheritedCardProps> = ({ apartment }) => {
  const pageStyles = usePageStyles();

  const verifiedBadge = apartment.addressPlaceId && (
    <Chip variant={CHIP_VARIANTS.ALERT} label={PROJECT_INTAKE_COPY.VERIFIED_BADGE} />
  );

  return (
    <Card>
      <CardHeader icon={ICON_NAMES.INFO} title={APARTMENT_PAGE_COPY.INHERITED_TITLE} />
      <Box sx={pageStyles.stack({ gap: "14px" })}>
        <InheritedValueTile
          source="building"
          label={APARTMENT_PAGE_COPY.PROJECT_TYPE}
          value={formatCustomerDetailValue(apartment.projectType?.name ?? null)}
        />
        <InheritedValueTile
          source="building"
          badge={verifiedBadge}
          label={APARTMENT_PAGE_COPY.ADDRESS}
          value={formatCustomerDetailValue(apartment.address)}
        />
        <InheritedValueTile
          source="own"
          label={APARTMENT_PAGE_COPY.UNIT}
          value={formatApartmentUnit(apartment)}
        />
      </Box>
    </Card>
  );
};

export default ApartmentInheritedCard;
