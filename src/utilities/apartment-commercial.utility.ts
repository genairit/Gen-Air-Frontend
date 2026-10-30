import {
  APARTMENT_OWNERSHIP,
  APARTMENT_OWNERSHIP_LABELS,
  type ApartmentOwnershipType,
} from "../constants/apartment-commercial.constant";

export const isApartmentOwnership = (value: unknown): value is ApartmentOwnershipType =>
  value === APARTMENT_OWNERSHIP.BUYER || value === APARTMENT_OWNERSHIP.LANDOWNER;

export const isApartmentCredit = (value: unknown): value is string =>
  typeof value === "string" && /^\d+(\.\d{1,2})?$/.test(value);

export const formatApartmentOwnership = (value: ApartmentOwnershipType | null): string =>
  value === null ? "לא הוגדר" : APARTMENT_OWNERSHIP_LABELS[value];

export const formatApartmentCredit = (value: string | null): string =>
  value === null ? "לא הוזן" : `${value} ₪`;
