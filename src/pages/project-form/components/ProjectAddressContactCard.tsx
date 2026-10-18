import type {
  TContactValues,
  ContactFieldType,
  IVerifiedAddress,
} from "../../../interfaces/project.interface";

import {
  CONTACT_FIELDS,
  PROJECT_CONTACT_COPY,
  CONTACT_ROLE_SUGGESTIONS,
  type IContactFieldConfig,
} from "../../../constants/project-contact.constant";

import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { PROJECT_ADDRESS_COPY } from "../../../constants/project-address.constant";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { VALID_FIELD, getFieldFeedback } from "../../../utilities/field-feedback.utility";
import AddressAutocomplete from "../../../components/AddressAutocomplete/AddressAutocomplete";

interface IProjectAddressContactCardProps {
  requiresCity: boolean;
  contact: TContactValues;
  isContactRequired: boolean;
  isSubmitAttempted: boolean;
  isAddressRequired: boolean;
  address: IVerifiedAddress | null;
  onAddressChange: (address: IVerifiedAddress | null) => void;
  onContactChange: (field: ContactFieldType, value: string) => void;
}

const ProjectAddressContactCard: FC<IProjectAddressContactCardProps> = ({
  address,
  contact,
  requiresCity,
  onAddressChange,
  onContactChange,
  isAddressRequired,
  isContactRequired,
  isSubmitAttempted,
}) => {
  const styles = usePageStyles();
  const [touchedFields, setTouchedFields] = useState<ContactFieldType[]>([]);

  const markTouched = (field: ContactFieldType) =>
    setTouchedFields(current => (current.includes(field) ? current : [...current, field]));

  const renderContactField = (config: IContactFieldConfig) => {
    const value = contact[config.field];
    const feedback = getFieldFeedback({
      isSubmitAttempted,
      hint: config.hint,
      isTouched: touchedFields.includes(config.field),
      validation: isContactRequired ? config.validate(value) : VALID_FIELD,
    });

    return (
      <TextField
        isRequired
        value={value}
        key={config.field}
        title={config.label}
        isLtr={config.isLtr}
        startIcon={config.icon}
        type={FIELD_TYPES.TEXT}
        maxLength={config.maxLength}
        infoText={feedback.infoText}
        placeholder={config.placeholder}
        validator={() => feedback.validation}
        onBlur={() => markTouched(config.field)}
        slotProps={{ htmlInput: { inputMode: config.inputMode } }}
        onChange={nextValue => onContactChange(config.field, config.sanitize(nextValue))}
      />
    );
  };

  const renderRoleSuggestion = (role: string) => (
    <Button
      key={role}
      text={role}
      size={BUTTON_SIZES.COMPACT}
      onClick={() => onContactChange("contactRole", role)}
      variant={contact.contactRole === role ? BUTTON_VARIANTS.PRESSED : BUTTON_VARIANTS.NEUTRAL}
    />
  );

  return (
    <Card gap="22px" padding="28px">
      <CardHeader
        icon={ICON_NAMES.LOCATION}
        title={PROJECT_CONTACT_COPY.CARD_TITLE}
        subtitle={PROJECT_CONTACT_COPY.CARD_SUBTITLE}
      />
      <AddressAutocomplete
        value={address}
        onChange={onAddressChange}
        requiresCity={requiresCity}
        title={PROJECT_ADDRESS_COPY.LABEL}
        showMissingError={isSubmitAttempted && isAddressRequired}
      />
      <Box sx={styles.grid({ minColumnWidth: 220, gap: "20px" })}>
        {CONTACT_FIELDS.map(renderContactField)}
      </Box>
      <Box sx={styles.row({ gap: "10px" })}>
        <Box component="span" sx={styles.caption}>
          {PROJECT_CONTACT_COPY.COMMON_ROLES}
        </Box>
        {CONTACT_ROLE_SUGGESTIONS.map(renderRoleSuggestion)}
      </Box>
    </Card>
  );
};

export default ProjectAddressContactCard;
