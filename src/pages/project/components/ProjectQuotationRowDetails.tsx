import {
  QUOTATION_PROJECT_ROLE,
  type TQuotationProjectRole,
} from "../../../constants/quotation-sharing.constant";

import type { FC } from "react";
import type { IProjectQuotation } from "../../../interfaces/quotation.interface";
import ProjectQuotationSharedApartments from "./ProjectQuotationSharedApartments";
import ProjectQuotationSharedFromBuilding from "./ProjectQuotationSharedFromBuilding";

interface IProjectQuotationRowDetailsProps {
  quotation: IProjectQuotation;
}

const ROW_DETAILS_BY_ROLE: Record<TQuotationProjectRole, FC<IProjectQuotationRowDetailsProps>> = {
  [QUOTATION_PROJECT_ROLE.PRIMARY]: ProjectQuotationSharedApartments,
  [QUOTATION_PROJECT_ROLE.SHARED]: ProjectQuotationSharedFromBuilding,
};

const ProjectQuotationRowDetails: FC<IProjectQuotationRowDetailsProps> = ({ quotation }) => {
  const RowDetails = ROW_DETAILS_BY_ROLE[quotation.projectRole];

  return <RowDetails quotation={quotation} />;
};

export default ProjectQuotationRowDetails;
