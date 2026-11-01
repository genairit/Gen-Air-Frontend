import type { FC } from "react";
import { Box } from "@mui/material";
import Chip from "../../../components/Chip/Chip";
import { useStyles } from "./CustomerProjects.style";
import { CHIP_VARIANTS } from "../../../constants/chip.constant";
import { formatApartmentCount } from "../../../utilities/apartment.utility";
import { getCustomerProjectType } from "../../../utilities/customer-project.utility";
import { CUSTOMER_PROJECT_KINDS } from "../../../constants/customer-project.constant";
import type { ICustomerProjectItem } from "../../../interfaces/customer-project.interface";

interface ICustomerProjectTypeCellProps {
  project: ICustomerProjectItem;
}

const CustomerProjectTypeCell: FC<ICustomerProjectTypeCellProps> = ({ project }) => {
  const styles = useStyles();
  const isBuilding = project.kind === CUSTOMER_PROJECT_KINDS.BUILDING;
  const typeLabel = getCustomerProjectType(project);
  const apartmentLabel = formatApartmentCount(project.apartmentCount);
  return (
    <Box sx={styles.type}>
      <Chip label={typeLabel} variant={CHIP_VARIANTS.INSET} />
      {isBuilding && <Chip label={apartmentLabel} variant={CHIP_VARIANTS.INFO} />}
    </Box>
  );
};
export default CustomerProjectTypeCell;
