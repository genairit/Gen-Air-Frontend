import {
  PAYMENT_TERMS_COPY,
  PAYMENT_TERMS_LABELS,
  type PaymentTermsType,
} from "../../../constants/payment-terms.constant";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import { useStyles } from "./ProjectPaymentTermsCard.style";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";
import InlineError from "../../../components/InlineError/InlineError";
import { validatePaymentTermsNote } from "../../../utilities/validators";
import RadioIndicator from "../../../components/RadioButton/RadioIndicator";
import { CONTROL_SIZES } from "../../../constants/selection-control.constant";
import type { IPaymentTermsValues } from "../../../interfaces/project.interface";
import { FIELD_INPUT_LIMITS } from "../../../constants/field-validation.constant";
import { isPaymentTermsNoteRequired } from "../../../utilities/project-intake.utility";
import { getFieldFeedback, VALID_FIELD } from "../../../utilities/field-feedback.utility";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface IProjectPaymentTermsCardProps {
  wasReset: boolean;
  isRequired: boolean;
  isSubmitAttempted: boolean;
  value: IPaymentTermsValues;
  options: PaymentTermsType[];
  onChange: (value: IPaymentTermsValues) => void;
}

const ProjectPaymentTermsCard: FC<IProjectPaymentTermsCardProps> = ({
  value,
  options,
  wasReset,
  onChange,
  isRequired,
  isSubmitAttempted,
}) => {
  const styles = useStyles();
  const pageStyles = usePageStyles();
  const [isNoteTouched, setIsNoteTouched] = useState(false);

  const isNoteVisible = isPaymentTermsNoteRequired(value.terms);
  const isMissingTerms = isRequired && isSubmitAttempted && !value.terms;

  const noteFeedback = getFieldFeedback({
    isSubmitAttempted,
    isTouched: isNoteTouched,
    hint: PAYMENT_TERMS_COPY.NOTE_HINT,
    validation: isRequired ? validatePaymentTermsNote(value.note) : VALID_FIELD,
  });

  const renderOption = (terms: PaymentTermsType) => {
    const isSelected = value.terms === terms;

    return (
      <Box
        key={terms}
        role="radio"
        tabIndex={0}
        aria-checked={isSelected}
        sx={styles.option(isSelected)}
        onClick={() => onChange({ ...value, terms })}
      >
        <RadioIndicator checked={isSelected} size={CONTROL_SIZES.SMALL} />
        <Box sx={styles.optionText}>
          <Box component="b" sx={styles.optionTitle}>
            {PAYMENT_TERMS_LABELS[terms].title}
          </Box>
          <Box component="span" sx={styles.optionSubtitle}>
            {PAYMENT_TERMS_LABELS[terms].subtitle}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Card gap="22px" padding="28px">
      <CardHeader
        icon={ICON_NAMES.PAYMENT}
        title={PAYMENT_TERMS_COPY.TITLE}
        subtitle={PAYMENT_TERMS_COPY.SUBTITLE}
      />
      {wasReset && (
        <Box role="status" sx={styles.notice}>
          {PAYMENT_TERMS_COPY.RESET_NOTICE}
        </Box>
      )}
      <Box role="radiogroup" sx={pageStyles.grid({ minColumnWidth: 220, gap: "16px" })}>
        {options.map(renderOption)}
      </Box>
      {isNoteVisible && (
        <TextField
          multiline
          isRequired
          minRows={3}
          showCharCounter
          value={value.note}
          type={FIELD_TYPES.TEXT}
          infoText={noteFeedback.infoText}
          title={PAYMENT_TERMS_COPY.NOTE_LABEL}
          onBlur={() => setIsNoteTouched(true)}
          validator={() => noteFeedback.validation}
          onChange={note => onChange({ ...value, note })}
          placeholder={PAYMENT_TERMS_COPY.NOTE_PLACEHOLDER}
          maxLength={FIELD_INPUT_LIMITS.PAYMENT_TERMS_NOTE_CHARACTERS}
        />
      )}
      {isMissingTerms && <InlineError message={PAYMENT_TERMS_COPY.REQUIRED} />}
    </Card>
  );
};

export default ProjectPaymentTermsCard;
