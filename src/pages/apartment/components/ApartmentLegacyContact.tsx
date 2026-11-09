import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import DetailTile from "../../../components/DetailTile/DetailTile";
import { toTelephoneHref } from "../../../utilities/phone.utility";
import type { IApiProject } from "../../../interfaces/api.interface";
import { APARTMENT_PAGE_COPY } from "../../../constants/apartment.constant";

interface IApartmentLegacyContactProps {
  canRead: boolean;
  apartment: IApiProject;
}

const ApartmentLegacyContact: FC<IApartmentLegacyContactProps> = ({ apartment, canRead }) => {
  const styles = usePageStyles();
  const name = apartment.contactName?.trim();
  const phone = apartment.contactPhone?.trim();

  if (!canRead || apartment.customerId || (!name && !phone)) {
    return null;
  }

  return (
    <Box sx={styles.grid({ minColumnWidth: 180, gap: "14px" })}>
      {name && <DetailTile value={name} label={APARTMENT_PAGE_COPY.CONTACT_NAME} />}
      {phone && (
        <DetailTile
          isLtr
          value={phone}
          href={toTelephoneHref(phone)}
          label={APARTMENT_PAGE_COPY.CONTACT_PHONE}
        />
      )}
    </Box>
  );
};

export default ApartmentLegacyContact;
