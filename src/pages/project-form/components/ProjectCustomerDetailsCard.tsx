import {
  isLtrCustomerField,
  getCustomerDetailFields,
  getCustomerFieldFeedback,
} from "../../../utilities/customer-details.utility";

import {
  CUSTOMER_DETAILS_COPY,
  CUSTOMER_DETAILS_TITLES,
  CUSTOMER_FIELD_KIND_CONFIG,
  type ICustomerDetailFieldConfig,
} from "../../../constants/customer-details.constant";

import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import { type FC, type ReactNode, useState } from "react";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { CHIP_SIZES } from "../../../constants/chip.constant";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";
import InlineError from "../../../components/InlineError/InlineError";
import { formatFieldErrorCount } from "../../../utilities/text.utility";
import type { CustomerDetailFieldType } from "../../../interfaces/api.interface";
import type { TCustomerDetailValues } from "../../../interfaces/project.interface";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import type { ProjectDetailFieldSetType } from "../../../constants/project-detail-field-set.constant";

interface IProjectCustomerDetailsCardProps {
  typeName: string;
  errorCount: number;
  notice?: ReactNode;
  isSubmitAttempted: boolean;
  values: TCustomerDetailValues;
  fieldSet: ProjectDetailFieldSetType;
  onChange: (field: CustomerDetailFieldType, value: string) => void;
}

const ProjectCustomerDetailsCard: FC<IProjectCustomerDetailsCardProps> = ({
  notice,
  values,
  fieldSet,
  typeName,
  onChange,
  errorCount,
  isSubmitAttempted,
}) => {
  const styles = usePageStyles();
  const fields = getCustomerDetailFields(fieldSet);
  const [touchedFields, setTouchedFields] = useState<CustomerDetailFieldType[]>([]);

  const markTouched = (field: CustomerDetailFieldType) =>
    setTouchedFields(current => (current.includes(field) ? current : [...current, field]));

  const renderField = (config: ICustomerDetailFieldConfig) => {
    const kindConfig = CUSTOMER_FIELD_KIND_CONFIG[config.kind];
    const feedback = getCustomerFieldFeedback({
      config,
      isSubmitAttempted,
      value: values[config.field],
      isTouched: touchedFields.includes(config.field),
    });

    return (
      <TextField
        isRequired
        key={config.field}
        title={config.label}
        startIcon={config.icon}
        type={FIELD_TYPES.TEXT}
        value={values[config.field]}
        infoText={feedback.infoText}
        placeholder={config.placeholder}
        isLtr={isLtrCustomerField(config)}
        validator={() => feedback.validation}
        onBlur={() => markTouched(config.field)}
        onChange={value => onChange(config.field, kindConfig.sanitize(value))}
        slotProps={{
          htmlInput: { inputMode: kindConfig.inputMode, pattern: kindConfig.pattern ?? null },
        }}
      />
    );
  };

  return (
    <Card gap="22px" padding="28px">
      <CardHeader
        icon={ICON_NAMES.CUSTOMER}
        title={CUSTOMER_DETAILS_TITLES[fieldSet]}
        subtitle={CUSTOMER_DETAILS_COPY.SUBTITLE}
        action={<Chip label={typeName} size={CHIP_SIZES.MEDIUM} />}
      />
      {notice}
      {errorCount > 0 && <InlineError message={formatFieldErrorCount(errorCount)} />}
      <Box sx={styles.grid({ minColumnWidth: 260, gap: "20px" })}>{fields.map(renderField)}</Box>
    </Card>
  );
};

export default ProjectCustomerDetailsCard;
