import type {
  ICustomerFormField,
  ICreateCustomerPayload,
} from "../../../interfaces/customer.interface";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";

interface ICustomerFieldsCardProps {
  title: string;
  disabled: boolean;
  fields: ICustomerFormField[];
  values: ICreateCustomerPayload;
  onChange: (changes: Partial<ICreateCustomerPayload>) => void;
}

const CustomerFieldsCard: FC<ICustomerFieldsCardProps> = ({
  title,
  disabled,
  fields,
  values,
  onChange,
}) => {
  const styles = usePageStyles();
  return (
    <Card gap="20px">
      <CardHeader title={title} icon={ICON_NAMES.CUSTOMER} />
      <Box sx={styles.grid({ minColumnWidth: 220, gap: "16px" })}>
        {fields.map(field => (
          <TextField
            isRequired
            key={field.field}
            title={field.label}
            isLtr={field.isLtr}
            disabled={disabled}
            type={field.inputType}
            value={values[field.field]}
            validator={field.validator}
            maxLength={field.maxLength}
            onChange={value => onChange({ [field.field]: value })}
            slotProps={{ htmlInput: { "aria-label": field.label } }}
          />
        ))}
      </Box>
    </Card>
  );
};
export default CustomerFieldsCard;
