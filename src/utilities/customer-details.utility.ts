import type {
  IApiProject,
  IApiProjectType,
  CustomerDetailFieldType,
  IApiProjectCustomerDetails,
} from "../interfaces/api.interface";

import type {
  ITypeSwitch,
  ITypeSwitchSummary,
  TCustomerDetailValues,
} from "../interfaces/project.interface";

import {
  CUSTOMER_FIELD_KINDS,
  CUSTOMER_DETAILS_COPY,
  CUSTOMER_FIELD_KIND_CONFIG,
  CUSTOMER_DETAIL_SHORT_LABELS,
  CUSTOMER_DETAIL_FIELDS_BY_SET,
  type ICustomerDetailFieldConfig,
} from "../constants/customer-details.constant";

import { getFieldFeedback } from "./field-feedback.utility";
import { formatKeptFields, formatHiddenFields, formatNeededFields } from "./text.utility";
import type { ProjectDetailFieldSetType } from "../constants/project-detail-field-set.constant";

const EMPTY_CUSTOMER_DETAIL_VALUES: TCustomerDetailValues = {
  customerName: "",
  customerCity: "",
  customerUnit: "",
  customerFloor: "",
  customerPhone: "",
  customerEmail: "",
  customerAddress: "",
  customerApartment: "",
  customerCompanyNumber: "",
  customerAssociationNumber: "",
};

const CUSTOMER_DETAIL_FIELDS = Object.keys(EMPTY_CUSTOMER_DETAIL_VALUES).filter(
  (key): key is CustomerDetailFieldType => key in EMPTY_CUSTOMER_DETAIL_VALUES,
);

export const createEmptyCustomerDetailValues = (): TCustomerDetailValues => ({
  ...EMPTY_CUSTOMER_DETAIL_VALUES,
});

const toFieldValue = (value: string | number | null) => (value == null ? "" : String(value));

export const toCustomerDetailValues = (project: IApiProject): TCustomerDetailValues =>
  CUSTOMER_DETAIL_FIELDS.reduce<TCustomerDetailValues>(
    (values, field) => ({ ...values, [field]: toFieldValue(project[field]) }),
    createEmptyCustomerDetailValues(),
  );

export const findDetailFieldSet = (
  types: IApiProjectType[],
  typeId: string | null,
): ProjectDetailFieldSetType | null =>
  types.find(type => type.id === typeId)?.detailFieldSet ?? null;

export const getCustomerDetailFields = (
  fieldSet: ProjectDetailFieldSetType | null,
): ICustomerDetailFieldConfig[] => {
  if (!fieldSet) {
    return [];
  }

  return CUSTOMER_DETAIL_FIELDS_BY_SET[fieldSet];
};

export const validateCustomerDetail = (config: ICustomerDetailFieldConfig, value: string) =>
  CUSTOMER_FIELD_KIND_CONFIG[config.kind].validate(value.trim());

export const countCustomerDetailErrors = (
  values: TCustomerDetailValues,
  fieldSet: ProjectDetailFieldSetType | null,
) =>
  getCustomerDetailFields(fieldSet).filter(
    config => !validateCustomerDetail(config, values[config.field]).isValid,
  ).length;

const toFieldNames = (configs: ICustomerDetailFieldConfig[]) => configs.map(({ field }) => field);

export const summarizeTypeSwitch = ({
  values,
  toFieldSet,
  fromFieldSet,
}: {
  values: TCustomerDetailValues;
  toFieldSet: ProjectDetailFieldSetType;
  fromFieldSet: ProjectDetailFieldSetType;
}): ITypeSwitchSummary => {
  const previousFields = toFieldNames(getCustomerDetailFields(fromFieldSet));
  const nextFields = toFieldNames(getCustomerDetailFields(toFieldSet));
  const isFilled = (field: CustomerDetailFieldType) => Boolean(values[field].trim());

  return {
    needed: nextFields.filter(field => !isFilled(field)),
    kept: nextFields.filter(field => previousFields.includes(field) && isFilled(field)),
    hidden: previousFields.filter(field => !nextFields.includes(field) && isFilled(field)),
  };
};

interface ITypeSwitchRequest {
  toTypeId: string;
  types: IApiProjectType[];
  fromTypeId: string | null;
  values: TCustomerDetailValues;
}

export const buildTypeSwitch = ({
  types,
  values,
  toTypeId,
  fromTypeId,
}: ITypeSwitchRequest): ITypeSwitch | null => {
  const toFieldSet = findDetailFieldSet(types, toTypeId);
  const fromFieldSet = findDetailFieldSet(types, fromTypeId);

  if (!fromTypeId || !fromFieldSet || !toFieldSet) {
    return null;
  }

  if (fromFieldSet === toFieldSet) {
    return null;
  }

  return { fromTypeId, summary: summarizeTypeSwitch({ values, toFieldSet, fromFieldSet }) };
};

export const joinFieldLabels = (fields: CustomerDetailFieldType[]) =>
  fields
    .map(field => CUSTOMER_DETAIL_SHORT_LABELS[field])
    .join(CUSTOMER_DETAILS_COPY.LABEL_SEPARATOR);

const formatSummaryLine = (
  fields: CustomerDetailFieldType[],
  format: (labels: string) => string,
): string[] => {
  if (fields.length === 0) {
    return [];
  }

  return [format(joinFieldLabels(fields))];
};

export const toTypeSwitchLines = (summary: ITypeSwitchSummary): string[] => [
  ...formatSummaryLine(summary.kept, formatKeptFields),
  ...formatSummaryLine(summary.hidden, formatHiddenFields),
  ...formatSummaryLine(summary.needed, formatNeededFields),
];

const toPayloadValue = (config: ICustomerDetailFieldConfig, value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return config.kind === CUSTOMER_FIELD_KINDS.FLOOR ? Number(trimmed) : trimmed;
};

export const toCustomerDetailsPayload = (
  values: TCustomerDetailValues,
  fieldSet: ProjectDetailFieldSetType | null,
): Partial<IApiProjectCustomerDetails> =>
  Object.fromEntries(
    getCustomerDetailFields(fieldSet).map(config => [
      config.field,
      toPayloadValue(config, values[config.field]),
    ]),
  );

export const formatCustomerDetailValue = (value: string | number | null) => {
  const isMissing = value == null || value === "";

  if (isMissing) {
    return CUSTOMER_DETAILS_COPY.EMPTY_VALUE;
  }

  return String(value);
};

export const isLtrCustomerField = (config: ICustomerDetailFieldConfig) =>
  CUSTOMER_FIELD_KIND_CONFIG[config.kind].isLtr;

interface ICustomerFieldFeedbackOptions {
  value: string;
  isTouched: boolean;
  isSubmitAttempted: boolean;
  config: ICustomerDetailFieldConfig;
}

export const getCustomerFieldFeedback = ({
  value,
  config,
  isTouched,
  isSubmitAttempted,
}: ICustomerFieldFeedbackOptions) =>
  getFieldFeedback({
    isTouched,
    isSubmitAttempted,
    hint: config.hint,
    validation: validateCustomerDetail(config, value),
  });
