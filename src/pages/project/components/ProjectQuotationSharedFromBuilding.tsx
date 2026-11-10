import type { FC } from "react";
import Chip from "../../../components/Chip/Chip";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { CHIP_VARIANTS } from "../../../constants/chip.constant";
import type { IProjectQuotation } from "../../../interfaces/quotation.interface";
import { formatSharedFromBuilding } from "../../../utilities/quotation-sharing.utility";

interface IProjectQuotationSharedFromBuildingProps {
  quotation: IProjectQuotation;
}

const ProjectQuotationSharedFromBuilding: FC<IProjectQuotationSharedFromBuildingProps> = ({
  quotation,
}) => (
  <Chip
    icon={ICON_NAMES.BUILDING}
    variant={CHIP_VARIANTS.INFO}
    label={formatSharedFromBuilding(quotation.sharedFromCode)}
  />
);

export default ProjectQuotationSharedFromBuilding;
