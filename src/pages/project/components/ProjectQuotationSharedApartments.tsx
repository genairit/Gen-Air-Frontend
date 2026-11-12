import {
  formatSharedCount,
  isSharedWithApartments,
  formatApartmentPreview,
} from "../../../utilities/quotation-sharing.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import Chip from "../../../components/Chip/Chip";
import { usePageStyles } from "../../page.style";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { CHIP_VARIANTS } from "../../../constants/chip.constant";
import type { IProjectQuotation } from "../../../interfaces/quotation.interface";

interface IProjectQuotationSharedApartmentsProps {
  quotation: IProjectQuotation;
}

const ProjectQuotationSharedApartments: FC<IProjectQuotationSharedApartmentsProps> = ({
  quotation,
}) => {
  const styles = usePageStyles();

  if (!isSharedWithApartments(quotation)) {
    return null;
  }

  return (
    <>
      <Chip
        icon={ICON_NAMES.BUILDING}
        variant={CHIP_VARIANTS.INFO}
        label={formatSharedCount(quotation.sharedCount)}
      />
      <Box component="span" sx={styles.caption}>
        <Box component="bdi">{formatApartmentPreview(quotation.sharedApartmentNumbers)}</Box>
      </Box>
    </>
  );
};

export default ProjectQuotationSharedApartments;
