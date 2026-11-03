import type { IApiProject } from "../interfaces/api.interface";
import { isAddressAccepted, toProjectAddress } from "./address.utility";
import type { IProjectIntakeValues } from "../interfaces/project.interface";
import type { TProjectIntakePayload } from "../interfaces/api-request.interface";
import { ADDRESS_CITY_REQUIRED_BY_FIELD_SET } from "../constants/project-address.constant";
import type { ProjectDetailFieldSetType } from "../constants/project-detail-field-set.constant";

export const createEmptyIntakeValues = (): IProjectIntakeValues => ({ address: null });

export const toIntakeValues = (project: IApiProject): IProjectIntakeValues => ({
  address: toProjectAddress(project),
});

export const isCityRequired = (fieldSet: ProjectDetailFieldSetType | null) =>
  fieldSet ? ADDRESS_CITY_REQUIRED_BY_FIELD_SET[fieldSet] : false;

export interface IIntakeChangeSet {
  address: boolean;
}

export const getChangedIntakeGroups = (
  values: IProjectIntakeValues,
  original: IProjectIntakeValues | null,
): IIntakeChangeSet => ({
  address: !original || values.address?.placeId !== original.address?.placeId,
});

// Legacy projects predate verified addresses; enforce a value only if it existed or changed.
export const getRequiredIntakeGroups = (
  values: IProjectIntakeValues,
  original: IProjectIntakeValues | null,
): IIntakeChangeSet => ({
  address:
    !original || getChangedIntakeGroups(values, original).address || Boolean(original.address),
});

interface IIntakeValidationContext {
  values: IProjectIntakeValues;
  original: IProjectIntakeValues | null;
  fieldSet: ProjectDetailFieldSetType | null;
}

export const countIntakeErrors = ({ values, original, fieldSet }: IIntakeValidationContext) =>
  Number(
    getRequiredIntakeGroups(values, original).address &&
      !isAddressAccepted({ address: values.address, requiresCity: isCityRequired(fieldSet) }),
  );

export const toIntakePayload = (
  values: IProjectIntakeValues,
  original: IProjectIntakeValues | null,
): TProjectIntakePayload =>
  getChangedIntakeGroups(values, original).address
    ? { addressPlaceId: values.address?.placeId ?? null }
    : {};
