import type {
  ICustomerFormField,
  TCustomerFormErrors,
  ICreateCustomerPayload,
} from "../../../interfaces/customer.interface";

import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "./CustomerForm.style";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";
import type { IconNameType } from "../../../constants/icon.constant";
import { toErrorValidator } from "../../../utilities/field-feedback.utility";
import { CUSTOMER_IDENTITY_FIELDS } from "../../../constants/customer-form.constant";

interface ICustomerFieldsCardProps {
  title: string;
  subtitle: string;
  compact?: boolean;
  disabled: boolean;
  icon: IconNameType;
  children?: ReactNode;
  minColumnWidth?: number;
  errors: TCustomerFormErrors;
  fields: ICustomerFormField[];
  values: ICreateCustomerPayload;
  onChange: (changes: Partial<ICreateCustomerPayload>) => void;
}

const CustomerFieldsCard: FC<ICustomerFieldsCardProps> = ({
  icon,
  title,
  errors,
  fields,
  values,
  subtitle,
  disabled,
  children,
  compact = false,
  onChange,
  minColumnWidth = 250,
}) => {
  const styles = usePageStyles();

  const formStyles = useStyles();
  const inputs = (
    <Box sx={styles.grid({ minColumnWidth, gap: "20px" })}>
      {children}
      {fields.map(field => (
        <TextField
          key={field.field}
          title={field.label}
          isLtr={field.isLtr}
          disabled={disabled}
          type={field.inputType}
          maxLength={field.maxLength}
          infoText={field.hint ?? ""}
          value={values[field.field]}
          placeholder={field.placeholder}
          validator={toErrorValidator(errors[field.field])}
          onChange={value => onChange({ [field.field]: value })}
          slotProps={{ htmlInput: { "aria-label": field.label } }}
          isRequired={CUSTOMER_IDENTITY_FIELDS.some(identity => identity.field === field.field)}
        />
      ))}
    </Box>
  );
  if (compact) {
    return (
      <Box component="section">
        <Box component="h2" sx={formStyles.sectionTitle}>
          {title}
        </Box>
        {inputs}
      </Box>
    );
  }
  return (
    <Card gap="18px">
      <CardHeader icon={icon} title={title} subtitle={subtitle} />
      {inputs}
    </Card>
  );
};

export default CustomerFieldsCard;
