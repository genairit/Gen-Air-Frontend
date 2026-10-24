import {
  toPaymentTermsOptions,
  findPaymentTermsByLabel,
} from "../../../utilities/apartment.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import TextField from "../../../components/TextField/TextField";
import type { IApiProject } from "../../../interfaces/api.interface";
import { SURFACE_DEPTHS } from "../../../constants/surface.constant";
import InlineError from "../../../components/InlineError/InlineError";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { validatePaymentTermsNote } from "../../../utilities/validators";
import { APARTMENT_PAGE_COPY } from "../../../constants/apartment.constant";
import { PAYMENT_TERMS_COPY } from "../../../constants/payment-terms.constant";
import type { IApartmentFormValues } from "../../../interfaces/apartment.interface";
import { isPaymentTermsNoteRequired } from "../../../utilities/project-intake.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { getOptionLabels, findOptionLabelById } from "../../../utilities/option.utility";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface ICreationPaymentTermsTileProps {
  building: IApiProject;
  isSubmitAttempted: boolean;
  values: IApartmentFormValues;
  onChange: (changes: Partial<IApartmentFormValues>) => void;
}
const CreationPaymentTermsTile: FC<ICreationPaymentTermsTileProps> = ({
  building,
  values,
  onChange,
  isSubmitAttempted,
}) => {
  const styles = usePageStyles();
  const isOwn = values.paymentTerms !== null;
  const fieldSet = building.projectType?.detailFieldSet ?? null;
  const options = toPaymentTermsOptions(fieldSet);
  const showNote = isPaymentTermsNoteRequired(values.paymentTerms);
  const noteValidation = validatePaymentTermsNote(values.paymentTermsNote);
  const showError = isSubmitAttempted && showNote && !noteValidation.isValid;
  const overrideTerms = () =>
    onChange({
      paymentTerms: building.paymentTerms ?? options[0]?.id ?? null,
      paymentTermsNote: building.paymentTermsNote ?? "",
    });
  const resetTerms = () => onChange({ paymentTerms: null, paymentTermsNote: "" });
  const toggleLabel = isOwn ? APARTMENT_PAGE_COPY.RETURN_TO_PARENT : APARTMENT_PAGE_COPY.OVERRIDE;
  const toggleTerms = isOwn ? resetTerms : overrideTerms;
  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      {isOwn && (
        <Card gap="12px" padding="14px" depth={SURFACE_DEPTHS.INSET}>
          <Autocomplete
            isAutocomplete={false}
            options={getOptionLabels(options)}
            placeholder={APARTMENT_PAGE_COPY.CHOOSE_TERMS}
            value={findOptionLabelById(options, values.paymentTerms)}
            onChange={label =>
              onChange({
                paymentTerms: findPaymentTermsByLabel(fieldSet, label),
                paymentTermsNote: "",
              })
            }
          />
          {showNote && (
            <TextField
              multiline
              isRequired
              type={FIELD_TYPES.TEXT}
              value={values.paymentTermsNote}
              title={PAYMENT_TERMS_COPY.NOTE_LABEL}
              onChange={paymentTermsNote => onChange({ paymentTermsNote })}
            />
          )}
          {showError && <InlineError message={noteValidation.errorText} />}
        </Card>
      )}
      <Box sx={styles.row({})}>
        <Button text={toggleLabel} onClick={toggleTerms} variant={BUTTON_VARIANTS.NEUTRAL} />
      </Box>
    </Box>
  );
};
export default CreationPaymentTermsTile;
