import {
  formatApartmentCredit,
  formatApartmentOwnership,
} from "../../../utilities/apartment-commercial.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import { ICON_NAMES } from "../../../constants/icon.constant";
import DetailTile from "../../../components/DetailTile/DetailTile";
import CardHeader from "../../../components/CardHeader/CardHeader";
import type { IApiProject } from "../../../interfaces/api.interface";

interface IApartmentCommercialCardProps {
  apartment: IApiProject;
}

const ApartmentCommercialCard: FC<IApartmentCommercialCardProps> = ({ apartment }) => {
  const styles = usePageStyles();
  const ownership = formatApartmentOwnership(apartment.apartmentOwnership ?? null);
  const credit = formatApartmentCredit(apartment.apartmentCredit ?? null);
  return (
    <Card gap="18px">
      <CardHeader title="נתוני הדירה" icon={ICON_NAMES.HOME} />
      <Box sx={styles.grid({ minColumnWidth: 180, gap: "14px" })}>
        <DetailTile value={ownership} label="בעל קרקע בתמ״א / רוכש" />
        <DetailTile isLtr value={credit} label="מחיר זיכוי" />
      </Box>
    </Card>
  );
};

export default ApartmentCommercialCard;
