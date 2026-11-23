import {
  QUOTATION_PROJECT_ROLE,
  type TQuotationProjectRole,
} from "../../../constants/quotation-sharing.constant";

import type { FC } from "react";
import type { IProjectQuotation } from "../../../interfaces/quotation.interface";
import ProjectQuotationSharedApartments from "./ProjectQuotationSharedApartments";
import { useQuotationPublication } from "../../../hooks/quotation-publication.hook";
import ProjectQuotationSharedFromBuilding from "./ProjectQuotationSharedFromBuilding";
import QuotationPublicationNotice from "../../quotations/components/QuotationPublicationNotice";

interface IProjectQuotationRowDetailsProps {
  quotation: IProjectQuotation;
}

const ROW_DETAILS_BY_ROLE: Record<TQuotationProjectRole, FC<IProjectQuotationRowDetailsProps>> = {
  [QUOTATION_PROJECT_ROLE.PRIMARY]: ProjectQuotationSharedApartments,
  [QUOTATION_PROJECT_ROLE.SHARED]: ProjectQuotationSharedFromBuilding,
};

const ProjectQuotationRowDetails: FC<IProjectQuotationRowDetailsProps> = ({ quotation }) => {
  const publication = useQuotationPublication(quotation.id, quotation.version);
  const RowDetails = ROW_DETAILS_BY_ROLE[quotation.projectRole];

  return (
    <>
      <RowDetails quotation={quotation} />
      <QuotationPublicationNotice {...publication} />
    </>
  );
};

export default ProjectQuotationRowDetails;
