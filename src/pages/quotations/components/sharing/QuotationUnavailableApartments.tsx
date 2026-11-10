import type { FC } from "react";
import { Box } from "@mui/material";
import Chip from "../../../../components/Chip/Chip";
import { useStyles } from "./QuotationApartmentSharing.style";
import { ICON_NAMES } from "../../../../constants/icon.constant";
import { CHIP_VARIANTS } from "../../../../constants/chip.constant";
import { formatApartmentChoice } from "../../../../utilities/quotation-sharing.utility";
import type { IQuotationApartmentLink } from "../../../../interfaces/quotation.interface";
import { QUOTATION_SHARING_COPY } from "../../../../constants/quotation-sharing.constant";

interface IQuotationUnavailableApartmentsProps {
  links: IQuotationApartmentLink[];
}

const QuotationUnavailableApartments: FC<IQuotationUnavailableApartmentsProps> = ({ links }) => {
  const styles = useStyles();

  return (
    <Box role="group" sx={styles.unavailable} aria-label={QUOTATION_SHARING_COPY.UNAVAILABLE_TITLE}>
      <Box component="span" sx={styles.caption}>
        {QUOTATION_SHARING_COPY.UNAVAILABLE_TITLE}
      </Box>
      {links.map(link => (
        <Box key={link.apartmentId} sx={styles.unavailableRow}>
          <bdi>{formatApartmentChoice(link)}</bdi>
          <Chip
            icon={ICON_NAMES.INFO}
            variant={CHIP_VARIANTS.PLAIN}
            label={QUOTATION_SHARING_COPY.UNAVAILABLE_CHIP}
          />
        </Box>
      ))}
    </Box>
  );
};

export default QuotationUnavailableApartments;
