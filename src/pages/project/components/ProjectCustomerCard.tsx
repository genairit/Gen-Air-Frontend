import {
  isLtrCustomerField,
  getCustomerDetailFields,
  formatCustomerDetailValue,
} from "../../../utilities/customer-details.utility";

import {
  CUSTOMER_DETAILS_COPY,
  CUSTOMER_DETAILS_TITLES,
  type ICustomerDetailFieldConfig,
} from "../../../constants/customer-details.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { useStyles } from "./ProjectCustomerCard.style";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import type { IApiProject } from "../../../interfaces/api.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
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
  const styles = useStyles();

  const renderTile = (config: ICustomerDetailFieldConfig) => (
    <Box sx={styles.tile} key={config.field}>
      <Box component="span" sx={styles.label}>
        {config.label}
      </Box>
      <Box component="span" sx={styles.value({ isLtr: isLtrCustomerField(config) })}>
        {formatCustomerDetailValue(project[config.field])}
      </Box>
    </Box>
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
        title={CUSTOMER_DETAILS_TITLES[fieldSet]}
      />
      <Box sx={pageStyles.grid({ minColumnWidth: 200, gap: "14px" })}>
        {getCustomerDetailFields(fieldSet).map(renderTile)}
      </Box>
    </Card>
  );
};

export default ProjectCustomerCard;
