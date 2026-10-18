import {
  getPaymentTermsNotes,
  toPaymentTermsOptions,
  getPaymentTermsSource,
  toPaymentTermsOverride,
  findPaymentTermsByLabel,
} from "../../../utilities/apartment.utility";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import InheritedValueTile from "./InheritedValueTile";
import { useStyles } from "./InheritedValueTile.style";
import Button from "../../../components/Button/Button";
import TextField from "../../../components/TextField/TextField";
import type { IApiProject } from "../../../interfaces/api.interface";
import InlineError from "../../../components/InlineError/InlineError";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { validatePaymentTermsNote } from "../../../utilities/validators";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { PAYMENT_TERMS_COPY } from "../../../constants/payment-terms.constant";
import { FIELD_INPUT_LIMITS } from "../../../constants/field-validation.constant";
import type { IApartmentChanges } from "../../../interfaces/api-request.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { formatCustomerDetailValue } from "../../../utilities/customer-details.utility";
import { useUpdateApartmentMutation } from "../../../hooks/mutations/apartment.mutation";
import { getOptionLabels, findOptionLabelById } from "../../../utilities/option.utility";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { APARTMENT_PAGE_COPY, PAYMENT_TERMS_RESET } from "../../../constants/apartment.constant";
import {
  formatPaymentTerms,
  isPaymentTermsNoteRequired,
} from "../../../utilities/project-intake.utility";

interface IPaymentTermsTileProps {
  canEdit: boolean;
  building: IApiProject;
  apartment: IApiProject;
}

const PaymentTermsTile: FC<IPaymentTermsTileProps> = ({ canEdit, building, apartment }) => {
  const styles = useStyles();
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const updateMutation = useUpdateApartmentMutation();

  const fieldSet = apartment.projectType?.detailFieldSet ?? null;
  const options = toPaymentTermsOptions(fieldSet);
  const source = getPaymentTermsSource(apartment);
  const isOverridden = source === "overridden";
  const draftTerms = findPaymentTermsByLabel(fieldSet, draftLabel);
  const isNoteVisible = isPaymentTermsNoteRequired(draftTerms);
  const isNoteValid = !isNoteVisible || validatePaymentTermsNote(draftNote).isValid;
  const canSave = Boolean(draftTerms) && isNoteValid;

  const startEditing = () => {
    setDraftLabel(findOptionLabelById(options, apartment.paymentTerms));
    setDraftNote(apartment.paymentTermsNote ?? "");
    setIsEditing(true);
  };

  const saveChanges = (changes: IApartmentChanges) =>
    updateMutation.mutate(
      { apartmentId: apartment.id, changes },
      { onSuccess: () => setIsEditing(false) },
    );

  const saveOverride = () => {
    if (!draftTerms) {
      return;
    }

    saveChanges(toPaymentTermsOverride(draftTerms, draftNote));
  };

  return (
    <InheritedValueTile
      source={source}
      label={APARTMENT_PAGE_COPY.PAYMENT_TERMS}
      notes={getPaymentTermsNotes({ source, building })}
      value={formatCustomerDetailValue(formatPaymentTerms(apartment.paymentTerms))}
    >
      {isEditing && (
        <Box sx={styles.actions}>
          <Autocomplete
            value={draftLabel}
            isAutocomplete={false}
            onChange={setDraftLabel}
            options={getOptionLabels(options)}
            placeholder={APARTMENT_PAGE_COPY.CHOOSE_TERMS}
          />
          {isNoteVisible && (
            <TextField
              multiline
              isRequired
              minRows={2}
              value={draftNote}
              onChange={setDraftNote}
              type={FIELD_TYPES.TEXT}
              validator={validatePaymentTermsNote}
              title={PAYMENT_TERMS_COPY.NOTE_LABEL}
              placeholder={PAYMENT_TERMS_COPY.NOTE_PLACEHOLDER}
              maxLength={FIELD_INPUT_LIMITS.PAYMENT_TERMS_NOTE_CHARACTERS}
            />
          )}
          <Button
            disabled={!canSave}
            onClick={saveOverride}
            isLoading={updateMutation.isPending}
            text={APARTMENT_PAGE_COPY.SAVE_TERMS}
          />
          <Button
            text={APARTMENT_PAGE_COPY.CANCEL}
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={() => setIsEditing(false)}
          />
        </Box>
      )}
      {canEdit && !isEditing && (
        <Box sx={styles.actions}>
          <Button
            onClick={startEditing}
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={APARTMENT_PAGE_COPY.OVERRIDE}
          />
          {isOverridden && (
            <Button
              variant={BUTTON_VARIANTS.NEUTRAL}
              isLoading={updateMutation.isPending}
              text={APARTMENT_PAGE_COPY.RETURN_TO_PARENT}
              onClick={() => saveChanges(PAYMENT_TERMS_RESET)}
            />
          )}
        </Box>
      )}
      {updateMutation.isError && <InlineError message={getApiErrorMessage(updateMutation.error)} />}
    </InheritedValueTile>
  );
};

export default PaymentTermsTile;
