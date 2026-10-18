import type {
  IApartmentFormValues,
  ApartmentFormFieldType,
  IApartmentFormFieldConfig,
} from "../../../interfaces/apartment.interface";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { getFieldFeedback } from "../../../utilities/field-feedback.utility";
import { ICON_NAMES, type IconNameType } from "../../../constants/icon.constant";

interface IApartmentFieldsCardProps {
  title: string;
  subtitle?: string;
  icon?: IconNameType;
  minColumnWidth: number;
  isSubmitAttempted: boolean;
  values: IApartmentFormValues;
  fields: IApartmentFormFieldConfig[];
  onChange: (changes: Partial<IApartmentFormValues>) => void;
}

const ApartmentFieldsCard: FC<IApartmentFieldsCardProps> = ({
  title,
  fields,
  values,
  subtitle,
  onChange,
  minColumnWidth,
  isSubmitAttempted,
  icon = ICON_NAMES.HOME,
}) => {
  const styles = usePageStyles();
  const [touchedFields, setTouchedFields] = useState<ApartmentFormFieldType[]>([]);

  const markTouched = (field: ApartmentFormFieldType) =>
    setTouchedFields(current => [...current, field]);

  const renderField = (config: IApartmentFormFieldConfig) => {
    const feedback = getFieldFeedback({
      hint: null,
      isSubmitAttempted,
      isTouched: touchedFields.includes(config.field),
      validation: config.validate(values[config.field]),
    });

    return (
      <TextField
        key={config.field}
        type={config.type}
        title={config.label}
        value={values[config.field]}
        infoText={feedback.infoText}
        isRequired={config.isRequired}
        placeholder={config.placeholder}
        validator={() => feedback.validation}
        onBlur={() => markTouched(config.field)}
        onChange={value => onChange({ [config.field]: value })}
      />
    );
  };

  return (
    <Card gap="22px" padding="28px">
      <CardHeader icon={icon} title={title} subtitle={subtitle} />
      <Box sx={styles.grid({ minColumnWidth, gap: "16px" })}>{fields.map(renderField)}</Box>
    </Card>
  );
};

export default ApartmentFieldsCard;
