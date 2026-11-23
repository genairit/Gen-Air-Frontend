import {
  PAYMENT_TERMS,
  PAYMENT_TERMS_VALUES,
  PAYMENT_STAGES_LABEL,
  type PaymentTermsType,
} from "../../constants/payment-terms.constant";

import {
  addPaymentStage,
  changePaymentStage,
  removePaymentStage,
  paymentScheduleTotal,
  paymentConfigurationChoices,
  getCustomerPaymentConfigurationError,
} from "../../utilities/payment-configuration.utility";

import {
  PAYMENT_STAGE_LIMITS,
  PAYMENT_CONFIGURATION_COPY,
} from "../../constants/payment-configuration.constant";

import { Box } from "@mui/material";
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import ChoiceRow from "../ChoiceRow/ChoiceRow";
import { useId, useState, type FC } from "react";
import InlineError from "../InlineError/InlineError";
import { useStyles } from "./PaymentConfigurationEditor.style";
import { FIELD_TYPES } from "../TextField/constants/textfield.constants";
import { RadioChoiceNavigation } from "../../managers/radio-choice-navigation.manager";
import type { IPaymentConfiguration } from "../../interfaces/payment-configuration.interface";
import { BUTTON_SIZES, BUTTON_SHAPES, BUTTON_VARIANTS } from "../Button/constants/button.constants";

interface IPaymentConfigurationEditorProps {
  disabled?: boolean;
  amounts?: string[];
  allowUnset?: boolean;
  customLabel?: string;
  value: IPaymentConfiguration;
  termsOptions?: PaymentTermsType[];
  onChange: (value: IPaymentConfiguration) => void;
}
const PaymentConfigurationEditor: FC<IPaymentConfigurationEditorProps> = ({
  value,
  onChange,
  disabled = false,
  allowUnset = false,
  customLabel = PAYMENT_STAGES_LABEL,
  termsOptions = PAYMENT_TERMS_VALUES,
  amounts = [],
}) => {
  const styles = useStyles();
  const statusId = useId();
  const [pending, setPending] = useState<IPaymentConfiguration | null>(null);
  const schedule = value.paymentSchedule;
  const hasStages = schedule.length > 0;
  const isLegacyOther = allowUnset && value.paymentTerms === PAYMENT_TERMS.OTHER && !hasStages;
  const hasConflict = hasStages && value.paymentTerms !== null;
  const validation = getCustomerPaymentConfigurationError(value);
  const showValidation = hasStages && validation !== null && !hasConflict;
  const hasAmount = amounts.length > 0;
  const canAdd = schedule.length < PAYMENT_STAGE_LIMITS.COUNT;
  const choices = paymentConfigurationChoices({ value, allowUnset, customLabel, termsOptions });
  const selectedIndex = Math.max(
    0,
    choices.findIndex(choice => choice.selected),
  );
  const select = (next: IPaymentConfiguration): void => {
    const wouldDiscardStages = hasStages && next.paymentSchedule.length === 0;
    if (wouldDiscardStages) {
      setPending(next);
      return;
    }

    setPending(null);
    onChange(next);
  };
  const confirm = (): void => {
    if (pending === null) {
      return;
    }

    onChange(pending);
    setPending(null);
  };
  return (
    <Box sx={styles.root}>
      <Box role="radiogroup" sx={styles.choices} aria-label={PAYMENT_CONFIGURATION_COPY.LABEL}>
        {choices.map((choice, index) => (
          <ChoiceRow
            role="radio"
            key={choice.id}
            sx={styles.choice}
            disabled={disabled}
            aria-checked={choice.selected}
            tabIndex={index === selectedIndex ? 0 : -1}
            onKeyDown={RadioChoiceNavigation.handleKey}
            onClick={() => select(choice.configuration)}
          >
            {choice.label}
          </ChoiceRow>
        ))}
      </Box>
      {hasConflict && <InlineError message={PAYMENT_CONFIGURATION_COPY.CONFLICT} />}
      {isLegacyOther && (
        <Box role="status" sx={styles.caption}>
          {PAYMENT_CONFIGURATION_COPY.LEGACY}
        </Box>
      )}
      {pending !== null && (
        <Box sx={styles.root}>
          <Box sx={styles.caption}>{PAYMENT_CONFIGURATION_COPY.CONFIRM_MESSAGE}</Box>
          <Box sx={styles.row}>
            <Button
              onClick={confirm}
              disabled={disabled}
              text={
                pending.paymentTerms === null
                  ? PAYMENT_CONFIGURATION_COPY.CONFIRM_CLEAR
                  : PAYMENT_CONFIGURATION_COPY.CONFIRM
              }
            />
            <Button
              disabled={disabled}
              onClick={() => setPending(null)}
              variant={BUTTON_VARIANTS.NEUTRAL}
              text={PAYMENT_CONFIGURATION_COPY.CANCEL}
            />
          </Box>
        </Box>
      )}
      {schedule.map((stage, index) => (
        <Box key={index} sx={styles.stage({ hasAmount })}>
          <TextField
            isLtr
            compact
            disabled={disabled}
            value={stage.percent}
            type={FIELD_TYPES.NUMBER}
            title={PAYMENT_CONFIGURATION_COPY.PERCENT}
            onChange={percent =>
              onChange(changePaymentStage({ configuration: value, index, changes: { percent } }))
            }
            slotProps={{
              htmlInput: {
                min: 0,
                max: 100,
                step: "0.0001",
                "aria-label": PAYMENT_CONFIGURATION_COPY.PERCENT,
                "aria-describedby": statusId,
              },
            }}
          />
          <Box sx={styles.description}>
            <TextField
              compact
              value={stage.text}
              disabled={disabled}
              type={FIELD_TYPES.TEXT}
              maxLength={PAYMENT_STAGE_LIMITS.TEXT}
              title={PAYMENT_CONFIGURATION_COPY.MILESTONE}
              onChange={text =>
                onChange(changePaymentStage({ configuration: value, index, changes: { text } }))
              }
              slotProps={{
                htmlInput: {
                  "aria-label": PAYMENT_CONFIGURATION_COPY.MILESTONE,
                  "aria-describedby": statusId,
                },
              }}
            />
          </Box>
          {hasAmount && (
            <Box component="bdi" sx={styles.amount}>
              {amounts[index] ?? ""}
            </Box>
          )}
          {!disabled && (
            <Box sx={styles.remove}>
              <Button
                text="×"
                size={BUTTON_SIZES.COMPACT}
                shape={BUTTON_SHAPES.CIRCLE}
                variant={BUTTON_VARIANTS.NEUTRAL}
                onClick={() => onChange(removePaymentStage(value, index))}
                ariaLabel={`${PAYMENT_CONFIGURATION_COPY.REMOVE} ${index + 1}`}
              />
            </Box>
          )}
        </Box>
      ))}
      <Box sx={styles.row}>
        <Box sx={styles.caption}>סה״כ {paymentScheduleTotal(value)}%</Box>
        {!disabled && (
          <Button
            disabled={!canAdd}
            size={BUTTON_SIZES.COMPACT}
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={PAYMENT_CONFIGURATION_COPY.ADD}
            onClick={() => onChange(addPaymentStage(value))}
            ariaLabel={PAYMENT_CONFIGURATION_COPY.ADD_LABEL}
          />
        )}
      </Box>
      <Box id={statusId} role="status" sx={styles.caption}>
        {showValidation ? PAYMENT_CONFIGURATION_COPY.INVALID : null}
      </Box>
    </Box>
  );
};
export default PaymentConfigurationEditor;
