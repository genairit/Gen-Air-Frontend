import type {
  ICustomerFormField,
  TCustomerFormErrors,
  ICreateCustomerPayload,
} from "../../../interfaces/customer.interface";

import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";
import type { IconNameType } from "../../../constants/icon.constant";
import { toErrorValidator } from "../../../utilities/field-feedback.utility";

interface ICustomerFieldsCardProps {
  title: string;
  subtitle: string;
  disabled: boolean;
  icon: IconNameType;
  children?: ReactNode;
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
  onChange,
}) => {
  const styles = usePageStyles();

  return (
    <Card gap="18px">
      <CardHeader icon={icon} title={title} subtitle={subtitle} />
      <Box sx={styles.grid({ minColumnWidth: 250, gap: "20px" })}>
        {children}
        {fields.map(field => (
          <TextField
            isRequired
            key={field.field}
            title={field.label}
            isLtr={field.isLtr}
            disabled={disabled}
            type={field.inputType}
            value={values[field.field]}
            maxLength={field.maxLength}
            infoText={field.hint ?? ""}
            placeholder={field.placeholder}
            validator={toErrorValidator(errors[field.field])}
            onChange={value => onChange({ [field.field]: value })}
            slotProps={{ htmlInput: { "aria-label": field.label } }}
          />
        ))}
      </Box>
    </Card>
  );
};

export default CustomerFieldsCard;
