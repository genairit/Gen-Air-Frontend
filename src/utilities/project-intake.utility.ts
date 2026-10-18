import type {
  TContactValues,
  IPaymentTermsValues,
  IProjectIntakeValues,
} from "../interfaces/project.interface";

import {
  PAYMENT_TERMS,
  PAYMENT_TERMS_LABELS,
  type PaymentTermsType,
  PAYMENT_TERMS_BY_FIELD_SET,
} from "../constants/payment-terms.constant";

import { validatePaymentTermsNote } from "./validators";
import type { IApiProject } from "../interfaces/api.interface";
import { CONTACT_FIELDS } from "../constants/project-contact.constant";
import { isAddressAccepted, toProjectAddress } from "./address.utility";
import type { TProjectIntakePayload } from "../interfaces/api-request.interface";
import { ADDRESS_CITY_REQUIRED_BY_FIELD_SET } from "../constants/project-address.constant";
import type { ProjectDetailFieldSetType } from "../constants/project-detail-field-set.constant";

const EMPTY_CONTACT_VALUES: TContactValues = {
  contactName: "",
  contactRole: "",
  contactPhone: "",
};

export const createEmptyIntakeValues = (): IProjectIntakeValues => ({
  address: null,
  contact: { ...EMPTY_CONTACT_VALUES },
  paymentTerms: { terms: null, note: "" },
});

export const toIntakeValues = (project: IApiProject): IProjectIntakeValues => ({
  address: toProjectAddress(project),
  paymentTerms: { terms: project.paymentTerms, note: project.paymentTermsNote ?? "" },
  contact: {
    contactName: project.contactName ?? "",
    contactRole: project.contactRole ?? "",
    contactPhone: project.contactPhone ?? "",
  },
});

export const isCityRequired = (fieldSet: ProjectDetailFieldSetType | null) =>
  fieldSet ? ADDRESS_CITY_REQUIRED_BY_FIELD_SET[fieldSet] : false;

export const getPaymentTermsOptions = (fieldSet: ProjectDetailFieldSetType | null) =>
  fieldSet ? PAYMENT_TERMS_BY_FIELD_SET[fieldSet] : [];

const isPaymentTermsAllowed = (
  terms: PaymentTermsType | null,
  fieldSet: ProjectDetailFieldSetType | null,
) => !terms || getPaymentTermsOptions(fieldSet).includes(terms);

export const fitPaymentTermsToFieldSet = (
  paymentTerms: IPaymentTermsValues,
  fieldSet: ProjectDetailFieldSetType | null,
): IPaymentTermsValues => {
  if (isPaymentTermsAllowed(paymentTerms.terms, fieldSet)) {
    return paymentTerms;
  }

  return { ...paymentTerms, terms: null };
};

export const isPaymentTermsNoteRequired = (terms: PaymentTermsType | null) =>
  terms === PAYMENT_TERMS.OTHER;

const countContactErrors = (contact: TContactValues) =>
  CONTACT_FIELDS.filter(config => !config.validate(contact[config.field]).isValid).length;

const countPaymentTermsErrors = ({ terms, note }: IPaymentTermsValues) => {
  if (!terms) {
    return 1;
  }

  const hasInvalidNote =
    isPaymentTermsNoteRequired(terms) && !validatePaymentTermsNote(note).isValid;

  return hasInvalidNote ? 1 : 0;
};

const hasContactValue = (contact: TContactValues) =>
  Object.values(contact).some(value => Boolean(value.trim()));

const isSameContact = (current: TContactValues, original: TContactValues) =>
  CONTACT_FIELDS.every(({ field }) => current[field].trim() === original[field].trim());

const isSamePaymentTerms = (current: IPaymentTermsValues, original: IPaymentTermsValues) =>
  current.terms === original.terms && current.note.trim() === original.note.trim();

const isSameAddress = (current: IProjectIntakeValues, original: IProjectIntakeValues) =>
  current.address?.placeId === original.address?.placeId;

export interface IIntakeChangeSet {
  address: boolean;
  contact: boolean;
  paymentTerms: boolean;
}

const ALL_INTAKE_GROUPS: IIntakeChangeSet = { address: true, contact: true, paymentTerms: true };

export const getChangedIntakeGroups = (
  values: IProjectIntakeValues,
  original: IProjectIntakeValues | null,
): IIntakeChangeSet => {
  if (!original) {
    return ALL_INTAKE_GROUPS;
  }

  return {
    address: !isSameAddress(values, original),
    contact: !isSameContact(values.contact, original.contact),
    paymentTerms: !isSamePaymentTerms(values.paymentTerms, original.paymentTerms),
  };
};

// Legacy projects predate the intake fields; like the server, only groups that are set or edited are enforced.
export const getRequiredIntakeGroups = (
  values: IProjectIntakeValues,
  original: IProjectIntakeValues | null,
): IIntakeChangeSet => {
  const changed = getChangedIntakeGroups(values, original);

  if (!original) {
    return changed;
  }

  return {
    address: changed.address || Boolean(original.address),
    contact: changed.contact || hasContactValue(original.contact),
    paymentTerms: changed.paymentTerms || Boolean(original.paymentTerms.terms),
  };
};

interface IIntakeValidationContext {
  values: IProjectIntakeValues;
  original: IProjectIntakeValues | null;
  fieldSet: ProjectDetailFieldSetType | null;
}

export const countIntakeErrors = ({ values, original, fieldSet }: IIntakeValidationContext) => {
  const required = getRequiredIntakeGroups(values, original);
  const requiresCity = isCityRequired(fieldSet);
  const isAddressValid = isAddressAccepted({ address: values.address, requiresCity });

  const addressErrors = required.address && !isAddressValid ? 1 : 0;
  const contactErrors = required.contact ? countContactErrors(values.contact) : 0;
  const paymentErrors = required.paymentTerms ? countPaymentTermsErrors(values.paymentTerms) : 0;

  return addressErrors + contactErrors + paymentErrors;
};

const toNullableText = (value: string) => value.trim() || null;

const toAddressPayload = ({ address }: IProjectIntakeValues): TProjectIntakePayload => ({
  addressPlaceId: address?.placeId ?? null,
});

const toContactPayload = ({ contact }: IProjectIntakeValues): TProjectIntakePayload => ({
  contactName: toNullableText(contact.contactName),
  contactRole: toNullableText(contact.contactRole),
  contactPhone: toNullableText(contact.contactPhone),
});

const toPaymentTermsPayload = ({ paymentTerms }: IProjectIntakeValues): TProjectIntakePayload => ({
  paymentTerms: paymentTerms.terms,
  paymentTermsNote: isPaymentTermsNoteRequired(paymentTerms.terms)
    ? toNullableText(paymentTerms.note)
    : null,
});

const PAYLOAD_BUILDERS: Record<
  keyof IIntakeChangeSet,
  (values: IProjectIntakeValues) => TProjectIntakePayload
> = {
  address: toAddressPayload,
  contact: toContactPayload,
  paymentTerms: toPaymentTermsPayload,
};

const INTAKE_GROUPS = Object.keys(PAYLOAD_BUILDERS).filter(
  (group): group is keyof IIntakeChangeSet => group in PAYLOAD_BUILDERS,
);

export const toIntakePayload = (
  values: IProjectIntakeValues,
  original: IProjectIntakeValues | null,
): TProjectIntakePayload => {
  const changed = getChangedIntakeGroups(values, original);

  return INTAKE_GROUPS.filter(group => changed[group]).reduce<TProjectIntakePayload>(
    (payload, group) => ({ ...payload, ...PAYLOAD_BUILDERS[group](values) }),
    {},
  );
};

export const formatPaymentTerms = (terms: PaymentTermsType | null) =>
  terms ? PAYMENT_TERMS_LABELS[terms].title : null;
