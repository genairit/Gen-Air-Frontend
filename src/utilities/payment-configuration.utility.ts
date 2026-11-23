import {
  PAYMENT_TERMS,
  PAYMENT_TERMS_LABELS,
  type PaymentTermsType,
} from "../constants/payment-terms.constant";

import {
  PAYMENT_DECIMAL,
  PAYMENT_STAGE_LIMITS,
  PAYMENT_PERCENT_PATTERN,
  PAYMENT_CONFIGURATION_COPY,
  PAYMENT_CONFIGURATION_CHOICES,
} from "../constants/payment-configuration.constant";

import type {
  IPaymentStageChange,
  IPaymentConfiguration,
  IPaymentConfigurationChoice,
  IPaymentConfigurationSource,
  IPaymentConfigurationChoiceOptions,
} from "../interfaces/payment-configuration.interface";

import type { IApiCustomer } from "../interfaces/api.interface";
import type { IQuotation } from "../interfaces/quotation.interface";

export const customerPaymentConfiguration = (
  source: IPaymentConfigurationSource,
): IPaymentConfiguration => ({
  paymentTerms: source.paymentTerms ?? null,
  paymentSchedule: (source.paymentSchedule ?? []).map(stage => ({ ...stage })),
});
export const paymentScheduleTotal = (
  configuration: Pick<IPaymentConfiguration, "paymentSchedule">,
): string =>
  configuration.paymentSchedule
    .reduce(
      (total, stage) => total.plus(PAYMENT_PERCENT_PATTERN.test(stage.percent) ? stage.percent : 0),
      new PAYMENT_DECIMAL(0),
    )
    .toString();
export const getCustomerPaymentConfigurationError = (
  configuration: IPaymentConfiguration,
): string | null => {
  const schedule = configuration.paymentSchedule;
  const hasConflict = schedule.length > 0 && configuration.paymentTerms !== null;
  if (hasConflict) {
    return PAYMENT_CONFIGURATION_COPY.CONFLICT;
  }

  if (schedule.length === 0) {
    return null;
  }
  const hasInvalidStage = schedule.some(stage => {
    const hasValidPercent = PAYMENT_PERCENT_PATTERN.test(stage.percent);
    const hasValidText =
      stage.text.trim().length > 0 && stage.text.length <= PAYMENT_STAGE_LIMITS.TEXT;
    if (!hasValidPercent || !hasValidText) {
      return true;
    }
    const percent = new PAYMENT_DECIMAL(stage.percent);
    return percent.lessThan(0) || percent.greaterThan(100);
  });
  const hasInvalidCount = schedule.length > PAYMENT_STAGE_LIMITS.COUNT;
  const hasInvalidTotal = paymentScheduleTotal(configuration) !== "100";
  return hasInvalidStage || hasInvalidCount || hasInvalidTotal
    ? PAYMENT_CONFIGURATION_COPY.INVALID
    : null;
};
export const configuredCustomerPaymentDefault = (
  customer: IPaymentConfigurationSource,
): IPaymentConfiguration | null => {
  const configuration = customerPaymentConfiguration(customer);
  const isLegacyOther = configuration.paymentTerms === PAYMENT_TERMS.OTHER;
  const isUnset = configuration.paymentTerms === null && configuration.paymentSchedule.length === 0;
  if (isLegacyOther || isUnset || getCustomerPaymentConfigurationError(configuration) !== null) {
    return null;
  }

  return configuration;
};
export const applyCustomerPaymentDefault = (
  quotation: IQuotation,
  customer: IApiCustomer | null,
): IQuotation => {
  if (customer?.id !== quotation.customerId) {
    return quotation;
  }
  const configuration = configuredCustomerPaymentDefault(customer);
  return configuration ? { ...quotation, ...configuration } : quotation;
};
export const selectPaymentConfigurationTerm = (
  paymentTerms: PaymentTermsType | null,
): IPaymentConfiguration => ({ paymentTerms, paymentSchedule: [] });
export const selectPaymentConfigurationStages = (
  configuration: IPaymentConfiguration,
): IPaymentConfiguration => ({
  paymentTerms: null,
  paymentSchedule: configuration.paymentSchedule.length
    ? configuration.paymentSchedule
    : [{ percent: "0", text: "" }],
});
export const changePaymentStage = ({
  index,
  changes,
  configuration,
}: IPaymentStageChange): IPaymentConfiguration => ({
  paymentTerms: null,
  paymentSchedule: configuration.paymentSchedule.map((stage, current) =>
    current === index ? { ...stage, ...changes } : stage,
  ),
});
export const removePaymentStage = (
  configuration: IPaymentConfiguration,
  index: number,
): IPaymentConfiguration => ({
  paymentTerms: null,
  paymentSchedule: configuration.paymentSchedule.filter((_stage, current) => current !== index),
});
export const addPaymentStage = (configuration: IPaymentConfiguration): IPaymentConfiguration => ({
  paymentTerms: null,
  paymentSchedule: [...configuration.paymentSchedule, { percent: "0", text: "" }],
});

export const paymentConfigurationChoices = ({
  value,
  allowUnset,
  customLabel,
  termsOptions,
}: IPaymentConfigurationChoiceOptions): IPaymentConfigurationChoice[] => {
  const hasStages = value.paymentSchedule.length > 0;
  const isUnset = value.paymentTerms === null && !hasStages;
  const isCustom = value.paymentTerms === null && hasStages;
  const isLegacyOther = allowUnset && value.paymentTerms === PAYMENT_TERMS.OTHER && !hasStages;
  return [
    ...termsOptions.map(term => ({
      id: term,
      label: PAYMENT_TERMS_LABELS[term].title,
      selected: !hasStages && value.paymentTerms === term,
      configuration: selectPaymentConfigurationTerm(term),
    })),
    {
      id: PAYMENT_CONFIGURATION_CHOICES.STAGES,
      label: customLabel,
      selected: isCustom || isLegacyOther,
      configuration: selectPaymentConfigurationStages(value),
    },
    ...(allowUnset
      ? [
          {
            id: PAYMENT_CONFIGURATION_CHOICES.NONE,
            label: PAYMENT_CONFIGURATION_COPY.NONE,
            selected: isUnset,
            configuration: selectPaymentConfigurationTerm(null),
          },
        ]
      : []),
  ];
};
export const paymentConfigurationSummary = (source: IPaymentConfigurationSource): string => {
  const configuration = customerPaymentConfiguration(source);
  if (configuration.paymentSchedule.length > 0) {
    return configuration.paymentSchedule
      .map(stage => `${stage.percent}% — ${stage.text}`)
      .join(" · ");
  }

  if (configuration.paymentTerms === PAYMENT_TERMS.OTHER) {
    return PAYMENT_CONFIGURATION_COPY.LEGACY;
  }

  return configuration.paymentTerms
    ? PAYMENT_TERMS_LABELS[configuration.paymentTerms].title
    : PAYMENT_CONFIGURATION_COPY.NONE;
};
