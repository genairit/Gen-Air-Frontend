import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import DetailTile from "../../../components/DetailTile/DetailTile";
import type { IApiProject } from "../../../interfaces/api.interface";
import { ADD_APARTMENT_COPY } from "../../../constants/apartment.constant";
import { formatPaymentTerms } from "../../../utilities/project-intake.utility";
import { formatInheritedNotesSummary } from "../../../utilities/apartment.utility";
import { formatCustomerDetailValue } from "../../../utilities/customer-details.utility";

interface IInheritedPreviewCardProps {
  building: IApiProject;
}

const InheritedPreviewCard: FC<IInheritedPreviewCardProps> = ({ building }) => {
  const styles = usePageStyles();

  return (
    <Card gap="18px">
      <CardHeader
        icon={ICON_NAMES.INFO}
        title={ADD_APARTMENT_COPY.INHERITED_TITLE}
        subtitle={ADD_APARTMENT_COPY.INHERITED_SUBTITLE}
        action={<Chip label={ADD_APARTMENT_COPY.FROM_PARENT} />}
      />
      <Box sx={styles.grid({ minColumnWidth: 200, gap: "14px" })}>
        <DetailTile
          label={ADD_APARTMENT_COPY.TYPE_LABEL}
          note={ADD_APARTMENT_COPY.NOT_CHANGEABLE}
          value={formatCustomerDetailValue(building.projectType?.name ?? null)}
        />
        <DetailTile
          note={ADD_APARTMENT_COPY.ADDRESS_NOTE}
          label={ADD_APARTMENT_COPY.ADDRESS_LABEL}
          value={formatCustomerDetailValue(building.address)}
        />
        <DetailTile
          note={ADD_APARTMENT_COPY.TERMS_NOTE}
          label={ADD_APARTMENT_COPY.TERMS_LABEL}
          value={formatCustomerDetailValue(formatPaymentTerms(building.paymentTerms))}
        />
        <DetailTile
          note={ADD_APARTMENT_COPY.NOTES_NOTE}
          label={ADD_APARTMENT_COPY.NOTES_LABEL}
          value={formatInheritedNotesSummary(building.notes)}
        />
      </Box>
    </Card>
  );
};

export default InheritedPreviewCard;
