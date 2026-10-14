import type { FC } from "react";
import { Box } from "@mui/material";
import Card from "../../../../components/Card/Card";
import ApartmentStageChip from "./ApartmentStageChip";
import { APARTMENT_COLUMN_STYLES } from "./columns/apartment-columns.style";
import type { IApiProject, IApiProjectStage } from "../../../../interfaces/api.interface";
import { formatEndCustomer, formatApartmentHeading } from "../../../../utilities/apartment.utility";

interface IApartmentMobileRowProps {
  apartment: IApiProject;
  stages: IApiProjectStage[];
  onOpen: (apartment: IApiProject) => void;
}

const ApartmentMobileRow: FC<IApartmentMobileRowProps> = ({ stages, apartment, onOpen }) => (
  <Card gap="10px" padding="16px" onClick={() => onOpen(apartment)}>
    <Box sx={APARTMENT_COLUMN_STYLES.mobileRow}>
      <Box component="b" sx={APARTMENT_COLUMN_STYLES.title}>
        {formatApartmentHeading(apartment)}
      </Box>
      <ApartmentStageChip stages={stages} apartment={apartment} />
    </Box>
    <Box component="span" sx={APARTMENT_COLUMN_STYLES.caption}>
      {`${formatEndCustomer(apartment)} · ${apartment.contactName ?? ""} · `}
      <bdi dir="ltr">{apartment.contactPhone}</bdi>
    </Box>
  </Card>
);

export default ApartmentMobileRow;
