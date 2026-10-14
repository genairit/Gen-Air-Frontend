import {
  isLtrCustomerField,
  getSiteDetailFields,
  formatCustomerDetailValue,
} from "../../../utilities/customer-details.utility";

import {
  CUSTOMER_DETAILS_COPY,
  type ICustomerDetailFieldConfig,
} from "../../../constants/customer-details.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import DetailTile from "../../../components/DetailTile/DetailTile";
import CardHeader from "../../../components/CardHeader/CardHeader";
import type { IApiProject } from "../../../interfaces/api.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { CUSTOMER_DETAIL_FIELDS, CUSTOMER_PICKER_COPY } from "../../../constants/customer.constant";
import type { ProjectDetailFieldSetType } from "../../../constants/project-detail-field-set.constant";

interface IProjectCustomerCardProps {
  typeName: string;
  project: IApiProject;
  onEdit: (() => void) | null;
  fieldSet: ProjectDetailFieldSetType;
}

const ProjectCustomerCard: FC<IProjectCustomerCardProps> = ({
  onEdit,
  project,
  fieldSet,
  typeName,
}) => {
  const pageStyles = usePageStyles();
  const customer = project.customer ?? null;

  const renderSiteTile = (config: ICustomerDetailFieldConfig) => (
    <DetailTile
      key={config.field}
      label={config.label}
      isLtr={isLtrCustomerField(config)}
      value={formatCustomerDetailValue(project[config.field])}
    />
  );

  const editAction = onEdit && (
    <Button
      onClick={onEdit}
      variant={BUTTON_VARIANTS.NEUTRAL}
      text={CUSTOMER_DETAILS_COPY.EDIT_DETAILS}
    />
  );

  return (
    <Card gap="18px" padding="24px">
      <CardHeader
        badge={typeName}
        action={editAction}
        icon={ICON_NAMES.CUSTOMER}
        title={CUSTOMER_DETAILS_COPY.VIEW_TITLE}
      />
      <Box sx={pageStyles.grid({ minColumnWidth: 200, gap: "14px" })}>
        {customer &&
          CUSTOMER_DETAIL_FIELDS.map(config => (
            <DetailTile
              key={config.field}
              label={config.label}
              isLtr={config.isLtr}
              value={customer[config.field]}
            />
          ))}
        {!customer && (
          <DetailTile
            label={CUSTOMER_PICKER_COPY.TITLE}
            value={CUSTOMER_PICKER_COPY.NOT_SELECTED}
          />
        )}
        {getSiteDetailFields(fieldSet).map(renderSiteTile)}
      </Box>
    </Card>
  );
};

export default ProjectCustomerCard;
